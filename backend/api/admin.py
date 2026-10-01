from django.contrib import admin
from .models import Profile, OrganizerProfile, PortfolioImage, PostLike, SavedPost, ViewHistory, Booking

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'firstname', 'lastname', 'phone', 'city')
    search_fields = ('user__username', 'firstname', 'lastname', 'city')

@admin.register(OrganizerProfile)
class OrganizerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'user', 'phone', 'email', 'rating')
    search_fields = ('company', 'user__username', 'location', 'address')

@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'organizer', 'service', 'city', 'created_at')
    search_fields = ('caption', 'service', 'city', 'organizer__company')

@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'created_at')
    search_fields = ('user__username', 'post__caption')

@admin.register(SavedPost)
class SavedPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'created_at')
    search_fields = ('user__username', 'post__caption')

@admin.register(ViewHistory)
class ViewHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'post', 'viewed_at')
    search_fields = ('user__username', 'post__caption')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'organizer', 'service', 'event_date', 'status', 'created_at')
    list_filter = ('status', 'event_date', 'service')
    search_fields = ('user__username', 'organizer__company', 'location', 'contact_phone', 'contact_email')
