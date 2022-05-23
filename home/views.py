from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

def home(request):
    context={}
    return render(request, 'Entity-extraction.html', context)
