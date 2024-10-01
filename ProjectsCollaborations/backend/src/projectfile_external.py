import numpy as np
import pandas as pd
import os
from datetime import date


df1 = pd.read_excel("backend\Data\CHM Grants\Grants.xlsx")
df2 = pd.read_excel("backend\Data\Investigators Data\Investigators External.xlsx")


df1 = df1[~df1["Type of Funding 1"].isin(["Education","Memorandum of Understanding"])]
df1 = df1[~df1["Type of Funding 2"].isin(["Non-Research"])]


years = dict()
college = dict()

for i in range(len(df1)):
    college[df1.iloc[i]['ARIES Grant ID']] = df1.iloc[i]["Administering_Primary_College"]
    if df1.isnull().iloc[i]['Grant Start Date']:
        years[df1.iloc[i]['ARIES Grant ID']] = (df1.iloc[i]['Awarded Date']).year
        
    else:
        years[df1.iloc[i]['ARIES Grant ID']] = (df1.iloc[i]['Grant Start Date']).year

print(len(df1))


# add an empty column
df2 = df2.reindex(columns = df2.columns.tolist() 
                                  + ['Years_new'])
df2 = df2.reindex(columns = df2.columns.tolist() 
                                  + ['Administering_Primary_College'])

print(df2.head(10))
for i in range(len(df2)):
    p_id = df2.iloc[i]['ARIES Grant ID']
    if p_id in years:
        df2.loc[i,'Years_new'] = years[p_id]

for i in range(len(df2)):
    p_id = df2.iloc[i]['ARIES Grant ID']
    if p_id in college:
        df2.loc[i,'Administering_Primary_College'] = college[p_id]


df2 = df2[df2['Years_new']>2017]
df2 = df2[df2['Years_new']<2024]

df2.reset_index(drop=True, inplace=True)
td = date.today()
df2.to_excel(f'backend\Data\Investgator Final Data\Project File External {td}.xlsx')






