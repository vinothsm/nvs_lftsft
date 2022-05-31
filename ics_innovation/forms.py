from django import forms
from .models import FileHandler

class UploadFileForm(forms.ModelForm):
    class Meta:
        model = FileHandler
        fields = ["media"]

    def save(self, commit=True):
        instance = super(UploadFileForm, self).save(commit=False)
        instance.name = instance.media.file._get_name()
        instance.filepath = "static/files/"+instance.media.file._get_name()
        if commit:
            instance.save()
        return instance
