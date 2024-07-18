from django.http import JsonResponse

def hello_world(request):
    return JsonResponse({'message': 'Hello, World!'})

def about_company(request):
    data = {
        'name': 'Special Finishes',
        'description': 'We provide top-notch finishing services for various projects.'
    }
    return JsonResponse({'data': data})

def our_work(request):
    projects = [
        {'title': 'Project 1', 'description': 'Description of project 1'},
        {'title': 'Project 2', 'description': 'Description of project 2'},
        {'title': 'Project 3', 'description': 'Description of project 3'},
    ]
    return JsonResponse({'projects': projects})

def home(request):
    return JsonResponse({'message': 'Welcome to Special Finishes Home Page'})

def testimonials(request):
    testimonials_list = [
        {"text": "Ruiter runs a very efficient business. Everyone that works for him is a Professional. The workers arrive on time and the work is done to perfection. He just renovated the bathroom in our rental condo. We suspected undetected problems with pipes due to a neighbor's renovation. No surprise when the bathroom was gutted to find a broken pipe. The problem was handled quickly, efficiently and didn't break the bank. I rate our experience 5 stars. I would hire him again in a second. Thank you for a beautiful job!", "client": "Valerie"},
        {"text": "The team at Special Finishes is amazing. They brought our vision to life with such creativity and professionalism.", "client": "John Doe"}
    ]
    return JsonResponse({'testimonials': testimonials_list})

def meet_owner(request):
    owner_info = {
        'name': 'Ruiter Fernandes',
        'description': 'Ruiter Fernandes, the visionary behind Special Finishes, has over 20 years of experience in the industry.'
    }
    return JsonResponse({'owner': owner_info})

def interior_exterior(request):
    data = {
        'title': 'Our Work in Interior and Exterior Design',
        'description': "We specialize in creating beautiful and functional interior and exterior spaces. Our team of experienced designers and craftsmen work together to bring your vision to life. Whether it's a cozy living room or a stunning outdoor patio, we ensure every detail is perfect."
    }
    return JsonResponse({'data': data})
