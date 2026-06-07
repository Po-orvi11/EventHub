from django.shortcuts import render
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, ProfileSerializer, OrganizerSerializer, PortfolioImageSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics
from rest_framework.response import Response
from .models import Profile, OrganizerProfile

# Create your views here.
class RegisterView(generics.CreateAPIView):
     queryset = User.objects.all()
     serializer_class = RegisterSerializer
     permission_classes = [
        AllowAny
    ]
     
class ProfileView(generics.RetrieveUpdateAPIView):
     serializer_class = ProfileSerializer
     permission_classes = [IsAuthenticated]

     def get_object(self):
          profile, created = (
            Profile.objects.get_or_create(
                user=self.request.user
            )
        )

          return profile
     
class CreateOrganizerProfileView(generics.CreateAPIView):
     serializer_class= OrganizerSerializer
     permission_classes = [IsAuthenticated]

     def perform_create(self, serializer):
          serializer.save(user= self.request.user)


class UpdateOrganizerProfileView(generics.RetrieveUpdateAPIView):
     serializer_class= OrganizerSerializer
     permission_classes= [IsAuthenticated]

     def get_object(self):
          return OrganizerProfile.objects.get(user=self.request.user)
     

class CreatePostView(generics.CreateAPIView):
     serializer_class = PortfolioImageSerializer
     permission_classes = [IsAuthenticated]

     def perform_create(self, serializer):
           organizer = OrganizerProfile.objects.get(
            user=self.request.user
           )

           serializer.save(organizer=organizer)