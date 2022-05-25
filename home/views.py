from django.shortcuts import render
from .models import Save_file
from django.http import HttpResponse

def home(request):
    context={}
    # return render(request, 'Entity-extraction.html', context)
    return render(request, 'index.html', context)


def extraction_page(request):
    context={}
    print(request)
    return render(request, 'Entity-extraction.html', context)


def review_page(request):
    context={}
    print(request)
    return render(request, 'review.html', context)
