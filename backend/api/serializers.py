from django.contrib.auth.models import User
from rest_framework import serializers
from .models import (
    Profile,
    OrganizerProfile,
    PortfolioImage,
    PostImage,
    PostLike,
    SavedPost,
    ViewHistory,
    Booking,
)
import random

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'firstname', 'lastname', 'phone', 'city']


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['id', 'image', 'created_at']


class PortfolioImageSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="organizer.company", read_only=True)
    organizer_id = serializers.IntegerField(source="organizer.id", read_only=True)
    additional_images = PostImageSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioImage
        fields = [
            'id', 'title', 'image', 'caption', 'description', 'service',
            'event_category', 'city', 'locality', 'price', 'availability',
            'company', 'organizer_id', 'additional_images', 'likes_count',
            'is_liked', 'is_saved', 'is_owner', 'created_at'
        ]

    def get_likes_count(self, obj):
        if hasattr(obj, 'likes_count_val'):
            return obj.likes_count_val
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.saved_by_users.filter(user=request.user).exists()
        return False

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.organizer.user_id == request.user.id
        return False


class OrganizerBasicSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = OrganizerProfile
        fields = [
            'id', 'company', 'username', 'profile_photo', 'bio',
            'location', 'address', 'phone', 'email', 'services',
            'price_range', 'packages', 'rating'
        ]


class PostDetailSerializer(serializers.ModelSerializer):
    organizer = OrganizerBasicSerializer(read_only=True)
    company = serializers.CharField(source="organizer.company", read_only=True)
    organizer_id = serializers.IntegerField(source="organizer.id", read_only=True)
    additional_images = PostImageSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioImage
        fields = [
            'id', 'title', 'image', 'caption', 'description', 'service',
            'event_category', 'city', 'locality', 'price', 'availability',
            'company', 'organizer_id', 'organizer', 'additional_images',
            'likes_count', 'is_liked', 'is_saved', 'is_owner', 'created_at'
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.saved_by_users.filter(user=request.user).exists()
        return False

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.organizer.user_id == request.user.id
        return False


class OrganizerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    portfolio_images = PortfolioImageSerializer(source="portfolioImage", many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = OrganizerProfile
        fields = [
            'id', 'company', 'username', 'profile_photo', 'bio', 'location',
            'address', 'portfolio_images', 'phone', 'email', 'services',
            'price_range', 'packages', 'rating', 'is_owner'
        ]

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False


class SavedPostSerializer(serializers.ModelSerializer):
    post = PortfolioImageSerializer(read_only=True)

    class Meta:
        model = SavedPost
        fields = ['id', 'post', 'created_at']


class ViewHistorySerializer(serializers.ModelSerializer):
    post = PortfolioImageSerializer(read_only=True)

    class Meta:
        model = ViewHistory
        fields = ['id', 'post', 'viewed_at']


class BookingSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    organizer_company = serializers.CharField(source="organizer.company", read_only=True)
    organizer_phone = serializers.CharField(source="organizer.phone", read_only=True)
    organizer_email = serializers.CharField(source="organizer.email", read_only=True)
    post_caption = serializers.CharField(source="post.caption", read_only=True, default=None)
    post_image = serializers.ImageField(source="post.image", read_only=True, default=None)

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_username', 'organizer', 'organizer_company',
            'organizer_phone', 'organizer_email', 'post', 'post_caption', 'post_image',
            'service', 'event_type', 'event_date', 'event_time', 'location', 'guests_count',
            'budget', 'special_notes', 'contact_phone', 'contact_email',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']

    def validate(self, data):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            organizer = data.get('organizer')
            event_date = data.get('event_date')
            service = data.get('service')
            # Check for existing duplicate active/pending booking
            existing = Booking.objects.filter(
                user=request.user,
                organizer=organizer,
                event_date=event_date,
                status__in=['PENDING', 'CONFIRMED']
            )
            if self.instance:
                existing = existing.exclude(id=self.instance.id)
            if existing.exists():
                raise serializers.ValidationError(
                    "You already have an active or pending booking with this organizer for this date."
                )
        return data


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status', 'special_notes']


class ExploreOptionSerializer(serializers.ModelSerializer):
    explore_image = serializers.SerializerMethodField()

    class Meta:
        model = OrganizerProfile
        fields = [
            "id",
            "company",
            "explore_image"
        ]

    def get_explore_image(self, obj):
        photos = list(obj.portfolioImage.all())
        if not photos:
            return None
        return random.choice(photos).image.url