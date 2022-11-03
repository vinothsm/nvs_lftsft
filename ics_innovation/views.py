from django.http import FileResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .forms import UploadDocuments
from .models import EntityExtractorV1
import requests as req

env = "dev"

@api_view(["GET"])
def get_extracted_data(request):
    json = []
    if env == "dev":
        json = [
            {
                'entity': 'BRAND',
                'expected_values': [
                    {'end_pos': 513, 'start_pos': 503, 'type': 'BRAND', 'value': 'Ioana Nita'}, {'end_pos': 594, 'start_pos': 574, 'type': 'BRAND', 'value': 'Grigore Alexandrescu'}]}, {'entity': 'FORM', 'expected_values': [{'end_pos': 68, 'start_pos': 62, 'type': 'FORM', 'value': 'Tablet'}, {'end_pos': 106, 'start_pos': 90, 'type': 'FORM', 'value': 'Powder for fever'}, {'end_pos': 187, 'start_pos': 186, 'type': 'FORM', 'value': '.'}, {'end_pos': 243, 'start_pos': 242, 'type': 'FORM', 'value': '.'}, {'end_pos': 367, 'start_pos': 366, 'type': 'FORM', 'value': '.'}, {'end_pos': 397, 'start_pos': 396, 'type': 'FORM', 'value': '.'}, {'end_pos': 539, 'start_pos': 514, 'type': 'FORM', 'value': 'Senior Regulatory Affairs'}]}, {'entity': 'STRENGTH', 'expected_values': [{'end_pos': 48, 'start_pos': 40, 'type': 'STRENGTH', 'value': '500mg/mL'}, {'end_pos': 61, 'start_pos': 53, 'type': 'STRENGTH', 'value': '100mg/mL'}, {'end_pos': 122, 'start_pos': 121, 'type': 'STRENGTH', 'value': '-'}, {'end_pos': 126, 'start_pos': 122, 'type': 'STRENGTH', 'value': '1000'}, {'end_pos': 127, 'start_pos': 126, 'type': 'STRENGTH', 'value': '-'}, {'end_pos': 131, 'start_pos': 127, 'type': 'STRENGTH', 'value': '1000'}]}, {'entity': 'NAME', 'expected_values': [{'end_pos': 122, 'start_pos': 117, 'type': 'NAME', 'value': 'A200-'}, {'end_pos': 501, 'start_pos': 492, 'type': 'NAME', 'value': 'John Cena'}, {'end_pos': 513, 'start_pos': 503, 'type': 'NAME', 'value': 'Ioana Nita'}]}, {'entity': 'ADDRESS', 'expected_values': [{'end_pos': 573, 'start_pos': 522, 'type': 'ADDRESS', 'value': 'Regulatory Affairs Associate Metropolis Center, Str'}]}, {'entity': 'SUBJID', 'expected_values': [{'end_pos': 131, 'start_pos': 117, 'type': 'SUBJID', 'value': 'A200-1000-1000'}]}, {'entity': 'AGE', 'expected_values': [{'end_pos': 390, 'start_pos': 388, 'type': 'AGE', 'value': '25'}]}, {'entity': 'DATE', 'expected_values': [{'end_pos': 366, 'start_pos': 353, 'type': 'DATE', 'value': '2nd June 2022'}]}, {'entity': 'COUNTRY', 'expected_values': [{'end_pos': 632, 'start_pos': 625, 'type': 'COUNTRY', 'value': 'Romania'}]}, {'entity': 'EMAIL', 'expected_values': [{'end_pos': 286, 'start_pos': 266, 'type': 'EMAIL', 'value': 'patient123@email.com'}]}, {'entity': 'HEIGHT', 'expected_values': [{'end_pos': 242, 'start_pos': 236, 'type': 'HEIGHT', 'value': '182 cm'}]}, {'entity': 'MEDICAL HISTORY', 'expected_values': [{'end_pos': 446, 'start_pos': 441, 'type': 'MEDICAL HISTORY', 'value': 'fever'}, {'end_pos': 463, 'start_pos': 451, 'type': 'MEDICAL HISTORY', 'value': 'hypertension'}, {'end_pos': 439, 'start_pos': 435, 'type': 'MEDICAL HISTORY', 'value': 'cold'}, {'end_pos': 508, 'start_pos': 503, 'type': 'MEDICAL HISTORY', 'value': 'Ioana'}, {'end_pos': 531, 'start_pos': 514, 'type': 'MEDICAL HISTORY', 'value': 'Senior Regulatory'}, {'end_pos': 463, 'start_pos': 451, 'type': 'MEDICAL HISTORY', 'value': 'hypertension'}, {'end_pos': 446, 'start_pos': 441, 'type': 'MEDICAL HISTORY', 'value': 'fever'}]}, {'entity': 'PHONE', 'expected_values': [{'end_pos': 325, 'start_pos': 310, 'type': 'PHONE', 'value': ' +91-8876291892'}, {'end_pos': 677, 'start_pos': 660, 'type': 'PHONE', 'value': ' +40 37 26 22 399'}, {'end_pos': 655, 'start_pos': 638, 'type': 'PHONE', 'value': ' +40 31 22 53 000'}, {'end_pos': 325, 'start_pos': 311, 'type': 'PHONE', 'value': '+91-8876291892'}]},
            {'entity': 'SITEID', 'expected_values': [{'end_pos': 126, 'start_pos': 122, 'type': 'SITEID', 'value': '1000'}, {
                'end_pos': 131, 'start_pos': 127, 'type': 'SITEID', 'value': '1000'}]},
            {
                'entity': 'WEIGHT', 'expected_values': [
                    {'end_pos': 221, 'start_pos': 216,
                    'type': 'WEIGHT', 'value': '23 kg'}
                ]
            },
            {
                "entity": "SUBJID",
                "expected_values": []
            }
        ]
    if env == "vdi":
        latest_doc = EntityExtractorV1.objects.order_by("-pk")[0]
        url = "http://10.185.56.168:8051/entities"
        resp = req.post(url, json={
            "input_text": latest_doc.extracted_text,
            "entity_types": latest_doc.entities
        })
        json = resp.json()

    if env == "prod":
        latest_doc = EntityExtractorV1.objects.order_by("-pk")[0]
        url = "http://localhost:8051/entities"
        resp = req.post(url, json={
            "input_text": latest_doc.extracted_text,
            "entity_types": latest_doc.entities
        })
        json = resp.json()

    return Response({"data": json})

@api_view(["GET"])
def get_extracted_text(request):
    latest_doc = EntityExtractorV1.objects.order_by("-pk")[0]
    return Response(latest_doc.extracted_text)


@api_view(["GET", "POST"])
def upload_page(request):
    context = {}
    if request.method == "GET":
        return render(request, 'ui_upload.html', context=context)
    if request.method == "POST":
        EntityExtractorV1.objects.all().delete()
        request.POST._mutable = True
        request.POST.update(
            {"entities": ",".join(request.POST.getlist("entities"))})
        files_=request.FILES.getlist('media')
        context={"page": "preview","response": ''}
        file_details=[]
        for  file in files_:
            request.FILES.setlist('media',[file])
            form = UploadDocuments(request.POST, request.FILES)
            if form.is_valid():
                form = form.save()
                form.save()
                file_details.append({
                    "original": form.staticpath,
                    "updated": form.staticpath,
                    "filename": form.filename
                })
        context['file_details'] = file_details
        print(context)
        return render(request, 'ui_review.html', context=context)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def review_page(request):
    latest_doc = EntityExtractorV1.objects.order_by("-pk")[0]
    context = {
        "staticpath": latest_doc.staticpath
    }
    return render(request, 'ui_review.html', context=context)
