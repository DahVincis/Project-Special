from django.urls import path
from .views import hello_world, about_company, our_work, home

urlpatterns = [
    path('', home, name='home'),
    path('hello/', hello_world, name='hello_world'),
    path('about/', about_company, name='about_company'),
    path('work/', our_work, name='our_work'),
]
