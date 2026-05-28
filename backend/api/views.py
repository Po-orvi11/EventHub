from django.shortcuts import render
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, ProfileSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics
from rest_framework.response import Response
from .models import Profile

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
     
# class loginView(generics.GenericAPIView):
#     serializer_class = LoginSerializer

#     def post(self, request):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         return Response(
#             {
#                 "message": "Login successful"
#             },
#             status=status.HTTP_200_OK
#         )
