from django.db import models

class EntityExtractorV1(models.Model):
    id = models.AutoField(primary_key=True)
    filepath = models.CharField(null=False, max_length=100)
    filename = models.CharField(null=False, max_length=100)
    entities = models.CharField(null=False, max_length=1000)
    media = models.FileField(null=False, blank=True, upload_to="files")
    extracted_text = models.TextField(null=False)
    staticpath = models.CharField(null=True, max_length=100)
    action = models.CharField(null=True, max_length=100)

    def __str__(self) -> str:
        return super().__str__()


class FileStatus(models.Model):
    file_id = models.AutoField(primary_key=True)
    req_id = models.CharField(null=False, max_length=100)
    local_filepath = models.CharField(null=False, max_length=100)
    filename = models.CharField(null=False, max_length=100)
    entities = models.CharField(null=False, max_length=1000)
    media = models.FileField(null=False, blank=True, upload_to="files")
    status = models.CharField(null=False, max_length=1000)
    s3_status = models.CharField(null=True, max_length=1000)
    s3_filepath = models.CharField(null=True, max_length=1000)
    api_status = models.CharField(null=True, max_length=1000)
    api_filepath = models.CharField(null=True, max_length=1000)
    staticpath = models.CharField(null=True, max_length=100)
    action = models.CharField(null=True, max_length=100)
    updated_at = models.DateField()

    def __str__(self) -> str:
        return super().__str__()