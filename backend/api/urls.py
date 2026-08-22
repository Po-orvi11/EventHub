from django.urls import path
from . import views

urlpatterns = [
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("organizer/create/", views.CreateOrganizerProfileView.as_view(), name="organizerprofile"),
    path("organizer/update/", views.UpdateOrganizerProfileView.as_view(), name="updateorganizerprofile"),
    path("post/create/", views.CreatePostView.as_view(),name="post_created"),
    path("post/<int:pk>/", views.CreatePostView.as_view(),name="post_details")
]
