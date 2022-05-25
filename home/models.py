from django.db import models

class Save_file(models.Model):
    """
    Model used to save the user level views
    """
    file_name = models.CharField(max_length=10000)
    file_saved = models.CharField(max_length=1000000)
    entities_selected = models.CharField(max_length=1000000)
    auto_increment_id = models.AutoField(primary_key=True)