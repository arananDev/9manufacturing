# Generated by Django 4.0.1 on 2022-04-26 09:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0019_reductionrequest_daterequested'),
    ]

    operations = [
        migrations.AddField(
            model_name='reductionrequest',
            name='quantity',
            field=models.DecimalField(decimal_places=4, default=0, max_digits=10),
        ),
    ]
