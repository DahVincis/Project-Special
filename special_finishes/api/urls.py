from django.urls import path
from .views import hello_world, about_company, our_work, home, testimonials, meet_owner, interior_exterior

urlpatterns = [
    path('', home, name='home'),
    path('hello/', hello_world, name='hello_world'),
    path('about/', about_company, name='about_company'),
    path('work/', our_work, name='our_work'),
    path('testimonials/', testimonials, name='testimonials'),
    path('meet_owner/', meet_owner, name='meet_owner'),
    path('interior_exterior/', interior_exterior, name='interior_exterior'),
]
