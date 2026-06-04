from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Profile, OrganizerProfile, PortfolioImage
import random

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
        fields = ['id','username','email','firstname','lastname','phone','city']

class PortfolioImageSerializer(serializers.ModelSerializer):
    class meta:
        model = PortfolioImage
        fields = ['id', 'image', 'caption']

class OrganizerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only = True)
    portfolio_images = PortfolioImageSerializer(many=True, read_only = True) 

    class Meta:
        model = OrganizerProfile
        fields =['id','company','username','bio','location','address','portfolio_images','phone','email','services','rating']


class ExploreOptionSerializer(serializers.ModelSerializer):
    explore_image = serializers.SerializerMethodField()

    class Meta:
        model = OrganizerProfile
        fields = [
            "id",
            "business_name",
            "explore_image"
        ]

    def get_home_image(self, obj):
        photos = list(obj.portfolio_images.all())

        if not photos:
            return None

        return random.choice(photos).image.url