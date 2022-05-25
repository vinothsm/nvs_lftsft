from django.urls import path
from home import views

urlpatterns = [
    path("", views.home, name="home"),
    path("extraction/", views.extraction_page, name="extraction_page"),
    path("review/", views.review_page, name="review_page")


    
]