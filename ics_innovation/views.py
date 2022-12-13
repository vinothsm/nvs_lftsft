from django.http import FileResponse,JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from .forms import UploadDocuments
from .models import EntityExtractorV1
import requests as req
import os, shutil
from pathlib import Path
import pandas as pd
import zipfile
import json
env = "dev"

@api_view(["GET", "POST"])
def upload_page(request):
    context = {}
    if request.method == "GET":
        return render(request, 'ui_upload.html', context=context)
    if request.method == "POST":
        request.POST._mutable = True
        request.POST.update(
            {"entities": ",".join(request.POST.getlist("entities"))})
        files_=request.FILES.getlist('media')
        entities_list=request.POST.getlist('entities')[-1]
        action = request.POST.getlist('action')[0]
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
                req_id = form.req_id
        context['file_details'] = file_details
        context['download_files']=''
        context['action']=action
        page_load_json = {'req_id':req_id,'s3_filepaths':'innovation_test_file11.pdf.enc','action':action,'entities':entities_list}
        print(req_id)
        # url = "https://privacyai-dev2.aws.novartis.net/innovation_api"
        # resp = req.post(url, json=page_load_json, verify=False, headers={'authorization':'privacyai'})
        url = "https://privacyai-dev2.aws.novartis.net/innovation_api?req_id="+page_load_json['req_id']+'&s3_filepaths='+page_load_json['s3_filepaths']+"&action="+page_load_json['action']+"&entities="+page_load_json['entities']
        resp = req.get(url, verify=False, headers={'authorization':'privacyai'})
        return render(request, 'ui_review.html', context=context)
    return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def review_page(request):
    file_details=[]
    action =''
    context ={}
    get_file_details = pd.DataFrame.from_records(
            EntityExtractorV1.objects.all().values())
    if not get_file_details.empty:
        for id,row in get_file_details.iterrows():
            file_details.append({
                    "original": row['staticpath'],
                    "updated": row['staticpath'],
                    "filename": row['filename']
                })
            action = row['action']
    context['file_details'] = file_details
    context['download_files']=''
    context['action']=action
    return render(request, 'ui_review.html', context=context)


def make_archive(source, destination):
        base = os.path.basename(destination)
        name = base.split('.')[0]
        format = base.split('.')[1]
        archive_from = os.path.dirname(source)
        archive_to = os.path.basename(source.strip(os.sep))
        shutil.make_archive(name, format, archive_from, archive_to)
        shutil.move('%s.%s'%(name,format), destination)


def check_modal_status(req_id):
    context ={}
    res=req.get('https://privacyai-dev2.aws.novartis.net/innovation_api_status?req_id='+req_id, headers={'authorization':'privacyai'},verify=False)
    if res.status_code == 200:
        resp_json = res.json()
        context['msg'] = resp_json['status']
        if context['msg'] == 'Done':
            context['output'] = resp_json['output']
    else:
        context['msg'] = 'err'
    print(context)
    return JsonResponse(context)

def upload_files_to_s3(file_list,req_id):
    print('upload_files_to_s3')
    # for file_ in file_list:
    #     uploaded_file = file_
    #     encrypted_file = '{}.enc'.format(uploaded_file)
    #     s3_encrypted_file = '{}/{}.enc'.format(req_id,'innovation_test_file.pdf')
    #     encryption_obj.encrypt_file(uploaded_file)
    #     sync_file_to_s3(encrypted_file, s3_encrypted_file)

