# Generated by Django 4.0.1 on 2022-07-04 08:40

import base.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0030_alter_stockitem_quantityinstock_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockitem',
            name='unit',
            field=models.CharField(choices=[('Kg', 'Kg'), ('Ltr', 'Ltr'), ('Each', 'Each'), ('MULTI', 'MULTI')], default='each', max_length=5, validators=[base.models.StockItem.validate_uom]),
        ),
    ]