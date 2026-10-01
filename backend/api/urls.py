from django.urls import path
from . import views

urlpatterns = [
    # Profile
    path("profile/", views.ProfileView.as_view(), name="profile"),

    # Organizer Profile
    path("organizer/create/", views.CreateOrganizerProfileView.as_view(), name="organizerprofile"),
    path("organizer/update/", views.UpdateOrganizerProfileView.as_view(), name="updateorganizerprofile"),
    path("organizer/<int:pk>/", views.OrganizerDetailView.as_view(), name="organizer_detail"),
    path("organizers/", views.OrganizerListView.as_view(), name="organizers_list"),

    # Posts & Feed
    path("post/create/", views.CreatePostView.as_view(), name="post_created"),
    path("post/<int:pk>/", views.PostDetailView.as_view(), name="post_details"),
    path("posts/", views.SearchPostsView.as_view(), name="posts_search"),
    path("posts/recommendations/", views.RecommendationPostsView.as_view(), name="posts_recommendations"),
    path("categories/", views.CategoryListView.as_view(), name="categories_list"),

    # Likes
    path("post/<int:pk>/like/", views.ToggleLikeView.as_view(), name="post_like_toggle"),
    path("liked-posts/", views.LikedPostsListView.as_view(), name="liked_posts"),

    # Saved Posts
    path("post/<int:pk>/save/", views.ToggleSaveView.as_view(), name="post_save_toggle"),
    path("saved-posts/", views.SavedPostsListView.as_view(), name="saved_posts"),

    # View History
    path("history/", views.ViewHistoryView.as_view(), name="view_history"),
    path("history/<int:pk>/", views.DeleteHistoryItemView.as_view(), name="delete_history_item"),

    # Bookings
    path("bookings/", views.BookingListCreateView.as_view(), name="bookings"),
    path("bookings/<int:pk>/", views.BookingDetailView.as_view(), name="booking_detail"),
    path("organizer/bookings/", views.OrganizerBookingsListView.as_view(), name="organizer_bookings"),
]
