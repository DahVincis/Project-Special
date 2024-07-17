from django.http import JsonResponse

def hello_world(request):
    return JsonResponse({'message': 'Hello, World!'})

def about_company(request):
    data = {
        'name': 'Special Finishes',
        'description': 'We provide top-notch finishing services for various projects.'
    }
    return JsonResponse(data)

def our_work(request):
    projects = [
        {'title': 'Project 1', 'description': 'Description of project 1'},
        {'title': 'Project 2', 'description': 'Description of project 2'},
        {'title': 'Project 3', 'description': 'Description of project 3'},
    ]
    return JsonResponse({'projects': projects})

def home(request):
    return JsonResponse({'message': 'Welcome to Special Finishes Home Page'})
