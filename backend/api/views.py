from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q, Count
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import (
    Profile,
    OrganizerProfile,
    PortfolioImage,
    PostLike,
    SavedPost,
    ViewHistory,
    Booking,
)
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
    OrganizerSerializer,
    PortfolioImageSerializer,
    PostDetailSerializer,
    SavedPostSerializer,
    ViewHistorySerializer,
    BookingSerializer,
    BookingStatusUpdateSerializer,
    OrganizerBasicSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile


class CreateOrganizerProfileView(generics.CreateAPIView):
    serializer_class = OrganizerSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UpdateOrganizerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = OrganizerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return OrganizerProfile.objects.get(user=self.request.user)


class OrganizerDetailView(generics.RetrieveAPIView):
    queryset = OrganizerProfile.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [AllowAny]


class OrganizerListView(generics.ListAPIView):
    serializer_class = OrganizerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = OrganizerProfile.objects.all()
        q = self.request.query_params.get("q", "").strip()
        service = self.request.query_params.get("service", "").strip()
        city = self.request.query_params.get("city", "").strip()

        if q:
            qs = qs.filter(
                Q(company__icontains=q)
                | Q(bio__icontains=q)
                | Q(location__icontains=q)
            )
        if city:
            qs = qs.filter(location__icontains=city)
        if service:
            qs = qs.filter(
                Q(services__icontains=service)
                | Q(portfolioImage__service__icontains=service)
            ).distinct()

        return qs


class CreatePostView(generics.ListCreateAPIView):
    serializer_class = PortfolioImageSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        organizer = OrganizerProfile.objects.get(user=self.request.user)
        serializer.save(organizer=organizer)

    def get_queryset(self):
        try:
            organizer = OrganizerProfile.objects.get(user=self.request.user)
            return PortfolioImage.objects.filter(organizer=organizer)
        except OrganizerProfile.DoesNotExist:
            return PortfolioImage.objects.none()


class PostDetailView(generics.RetrieveAPIView):
    queryset = PortfolioImage.objects.all()
    serializer_class = PostDetailSerializer
    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user and request.user.is_authenticated:
            ViewHistory.objects.update_or_create(
                user=request.user,
                post=instance
            )
        serializer = self.get_serializer(instance, context={"request": request})
        return Response(serializer.data)


class SearchPostsView(generics.ListAPIView):
    serializer_class = PortfolioImageSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = PortfolioImage.objects.select_related("organizer").all()
        q = self.request.query_params.get("q", "").strip()
        service = self.request.query_params.get("service", "").strip()
        category = self.request.query_params.get("category", "").strip()
        city = self.request.query_params.get("city", "").strip()
        organizer_id = self.request.query_params.get("organizer", "").strip()
        sort = self.request.query_params.get("sort", "latest").strip().lower()

        if q:
            queryset = queryset.filter(
                Q(caption__icontains=q)
                | Q(service__icontains=q)
                | Q(city__icontains=q)
                | Q(organizer__company__icontains=q)
                | Q(organizer__bio__icontains=q)
            )

        cat_filter = service or category
        if cat_filter and cat_filter.lower() != "all":
            queryset = queryset.filter(
                Q(service__icontains=cat_filter) | Q(caption__icontains=cat_filter)
            )

        if city and city.lower() != "all":
            queryset = queryset.filter(
                Q(city__icontains=city) | Q(organizer__location__icontains=city)
            )

        if organizer_id:
            queryset = queryset.filter(organizer_id=organizer_id)

        if sort in ["popular", "popularity"]:
            queryset = queryset.annotate(likes_count_val=Count("likes")).order_by(
                "-likes_count_val", "-created_at"
            )
        elif sort == "oldest":
            queryset = queryset.order_by("created_at")
        elif sort in ["rating", "relevance"]:
            queryset = queryset.order_by("-organizer__rating", "-created_at")
        else:
            queryset = queryset.order_by("-created_at")

        return queryset


class RecommendationPostsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base_qs = PortfolioImage.objects.select_related("organizer").all()

        popular_qs = base_qs.annotate(likes_count_val=Count("likes")).order_by(
            "-likes_count_val", "-created_at"
        )[:8]
        popular_data = PortfolioImageSerializer(
            popular_qs, many=True, context={"request": request}
        ).data

        recent_qs = base_qs.order_by("-created_at")[:8]
        recent_data = PortfolioImageSerializer(
            recent_qs, many=True, context={"request": request}
        ).data

        services = (
            PortfolioImage.objects.exclude(service="")
            .values_list("service", flat=True)
            .distinct()[:6]
        )
        by_category = {}
        for s in services:
            cat_posts = base_qs.filter(service__iexact=s).order_by("-created_at")[:4]
            by_category[s] = PortfolioImageSerializer(
                cat_posts, many=True, context={"request": request}
            ).data

        top_organizers = OrganizerProfile.objects.order_by("-rating")[:6]
        organizer_data = OrganizerBasicSerializer(top_organizers, many=True).data

        return Response(
            {
                "popular": popular_data,
                "recent": recent_data,
                "by_category": by_category,
                "top_organizers": organizer_data,
            }
        )


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        services = list(
            PortfolioImage.objects.exclude(service="")
            .values_list("service", flat=True)
            .distinct()
        )
        organizer_services = []
        for org in OrganizerProfile.objects.all():
            if isinstance(org.services, list):
                organizer_services.extend(org.services)
            elif isinstance(org.services, str) and org.services:
                organizer_services.extend([s.strip() for s in org.services.split(",") if s.strip()])
        all_services = sorted(list(set([s for s in services + organizer_services if s])))

        cities = list(
            PortfolioImage.objects.exclude(city="")
            .values_list("city", flat=True)
            .distinct()
        )
        organizer_cities = []
        for org in OrganizerProfile.objects.all():
            if org.location:
                organizer_cities.extend([c.strip() for c in org.location.split(",") if c.strip()])
        all_cities = sorted(list(set([c for c in cities + organizer_cities if c])))

        return Response({
            "services": all_services,
            "cities": all_cities
        })


class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(PortfolioImage, pk=pk)
        like = PostLike.objects.filter(user=request.user, post=post).first()
        if like:
            like.delete()
            liked = False
        else:
            PostLike.objects.create(user=request.user, post=post)
            liked = True
        return Response({
            "liked": liked,
            "likes_count": post.likes.count(),
            "message": "Post liked" if liked else "Post unliked"
        })


class ToggleSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(PortfolioImage, pk=pk)
        saved_post = SavedPost.objects.filter(user=request.user, post=post).first()
        if saved_post:
            saved_post.delete()
            saved = False
        else:
            SavedPost.objects.create(user=request.user, post=post)
            saved = True
        return Response({
            "saved": saved,
            "saves_count": post.saved_by_users.count(),
            "message": "Post saved" if saved else "Post removed from saved"
        })


class SavedPostsListView(generics.ListAPIView):
    serializer_class = SavedPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedPost.objects.filter(user=self.request.user).select_related(
            "post", "post__organizer"
        ).order_by("-created_at")


class LikedPostsListView(generics.ListAPIView):
    serializer_class = PortfolioImageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        liked_post_ids = PostLike.objects.filter(user=self.request.user).values_list("post_id", flat=True)
        return PortfolioImage.objects.filter(id__in=liked_post_ids).select_related("organizer").order_by("-created_at")


class ViewHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history = ViewHistory.objects.filter(user=request.user).select_related(
            "post", "post__organizer"
        ).order_by("-viewed_at")
        serializer = ViewHistorySerializer(history, many=True, context={"request": request})
        return Response(serializer.data)

    def delete(self, request):
        ViewHistory.objects.filter(user=request.user).delete()
        return Response({"message": "View history cleared successfully"})


class DeleteHistoryItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        item = ViewHistory.objects.filter(user=request.user, post_id=pk).first()
        if not item:
            item = ViewHistory.objects.filter(user=request.user, id=pk).first()
        if item:
            item.delete()
            return Response({"message": "Item removed from history"})
        return Response({"error": "Item not found in history"}, status=status.HTTP_404_NOT_FOUND)


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related("organizer", "post").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status="PENDING")


class BookingDetailView(generics.RetrieveUpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        booking = super().get_object()
        is_client = booking.user == self.request.user
        is_organizer = booking.organizer.user == self.request.user
        if not (is_client or is_organizer):
            raise PermissionDenied("You do not have permission to view or edit this booking.")
        return booking

    def update(self, request, *args, **kwargs):
        booking = self.get_object()
        is_client = booking.user == request.user
        is_organizer = booking.organizer.user == request.user

        if "status" in request.data:
            new_status = request.data["status"]
            if is_organizer:
                booking.status = new_status
            elif is_client and new_status == "CANCELLED":
                booking.status = "CANCELLED"
            else:
                return Response({"error": "Only the organizer can set this status."}, status=status.HTTP_403_FORBIDDEN)

        if "special_notes" in request.data:
            booking.special_notes = request.data["special_notes"]

        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)


class OrganizerBookingsListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(organizer__user=self.request.user).select_related(
            "user", "organizer", "post"
        ).order_by("-created_at")
