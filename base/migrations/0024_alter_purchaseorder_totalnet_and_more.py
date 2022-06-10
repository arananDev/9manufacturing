# Generated by Django 4.0.1 on 2022-05-31 12:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0023_alter_stockitem_unit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchaseorder',
            name='totalNet',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=13),
        ),
        migrations.AlterField(
            model_name='purchaseorder',
            name='totalVat',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=13),
        ),
        migrations.AlterField(
            model_name='purchaseorderline',
            name='conversionRate',
            field=models.DecimalField(decimal_places=2, default=1, max_digits=13),
        ),
        migrations.AlterField(
            model_name='purchaseorderline',
            name='goodsRecieved',
            field=models.DecimalField(decimal_places=3, default=0, max_digits=13),
        ),
        migrations.AlterField(
            model_name='purchaseorderline',
            name='price',
            field=models.DecimalField(decimal_places=3, max_digits=13),
        ),
        migrations.AlterField(
            model_name='purchaseorderline',
            name='quantity',
            field=models.DecimalField(decimal_places=4, max_digits=13),
        ),
        migrations.AlterField(
            model_name='purchaseorderline',
            name='unconvertedQuantity',
            field=models.DecimalField(decimal_places=4, max_digits=13, null=True),
        ),
    ]
