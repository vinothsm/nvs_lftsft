from django.db import models

class FileHandler(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    filepath = models.CharField(null=True, max_length=500)
    media = models.FileField(null=True, blank=True)

    def __str__(self):
        return self.id, self.name, self.filepath

