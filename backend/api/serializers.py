from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Profile

class RegisterSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only = True)

    class Meta:
        model = User
        fields = ['id','username','email','password','confirm_password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError(
                "Passwords do not match"
            )
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    
    username = serializers.CharField(source="user.username",read_only = True)
    email = serializers.CharField(source="user.email",read_only= True)

    class Meta:
        model = Profile
        fields = ['id','username','email','firstname','lastname','phone','location']

# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField()
#     password = serializers.CharField(write_only = True)

#     def validate(self, data):
#         user = authenticate(
#             username = data['username'],
#             password = data['password']
#         )

#         if not user:
#             raise serializers.ValidationError("Invalid credentials")
        
#         data['user'] = user
#         return data