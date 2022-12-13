from django import forms
from .models import EntityExtractorV1,FileStatus
from .extractor import get_fulltext_from_pdf
import os
from pathlib import Path
import re
import datetime

class UploadDocuments(forms.ModelForm):
    class Meta:
        model = FileStatus
        fields = ["media", "entities",'action']

    def save(self, commit=True):
        instance = super(UploadDocuments, self).save(commit=False)
        instance.req_id = 'innov_'+datetime.datetime.now().strftime("%d_%m_%Y_%H_%M_%S")
        f_name = re.sub('[\\[\\]\\(\\))&]', '',
                        instance.media.file._get_name())
        instance.staticpath = "files/"+f_name.replace(" ","_")
        instance.local_filepath = os.path.join(Path(__file__).parent, "static/files/"+f_name.replace(" ","_"))
        instance.status = 'uploaded'
        instance.s3_status = 'pending'
        instance.s3_filepath = None
        instance.api_status = None
        instance.api_filepath = None
        instance.updated_at = datetime.datetime.now()
        instance.filename = f_name.replace(" ","_")
        if commit:
            instance.save()
        return instance
