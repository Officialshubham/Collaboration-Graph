import numpy as np
import pandas as pd
import json
import os
from datetime import date

td = date.today()

df1 = pd.read_excel(f"backend\Data\Investgator Final Data\Project File External {td}.xlsx")
df2 = pd.read_excel(f"backend\Data\Investgator Final Data\Project File Internal {td}.xlsx")

#Preprocessing
df1 = df1[df1['Years_new']>2017]
df2 = df2[df2['Years_new']>2017]

df2['Employee ID'] = df2['Employee ID'].str.lower()

df2 = df2[df2['Employee ID'].str.startswith('u')]


for i in range(len(df1)):
    if df1.iloc[i]["Institution"].startswith("The"):
        df1.loc[i, "Institution"] = df1.iloc[i]["Institution"].replace("The ", "")
    df1.loc[i, "Institution"] = df1.iloc[i]["Institution"].strip()



g1 = df1.groupby('ARIES Grant ID')
data1 =  dict()

for grant_id,group in g1:
    external_ids=[]
    group = group.reset_index()
    # print(grant_id)
    # print(group)
    for i in range(0,len(group)):
        external_ids.append(group.iloc[i]['Co-investigator ID'])
    # data2[group.loc[group['Employee ID']=="u5289297",'Faculty name'].item()] = l
    data1[group.loc[group["ARIES Grant ID"]==grant_id,'ARIES Grant ID'].iloc[0]] = list(set(external_ids))
    
# print(len(data1))
# print(data1)

# print("*"*100)

g2 = df2.groupby('Employee ID')
data2 = dict()

all_emp =[]

for emp_id, group in g2:

    group = group.reset_index()
    if emp_id not in all_emp:
        all_emp.append(emp_id)
    grant_ids=[]
    # print(emp_id)
    # print(group)
    for i in range(0,len(group)):
        grant_ids.append(group.iloc[i]['ARIES Grant ID'])

    data2[group.loc[group['Employee ID']==emp_id,'Employee ID'].iloc[0]] = list(set(grant_ids))

# print(len(data2))
# print(data2)

# print("*"*100)

final_data = dict()

for emp_id, list_of_grant_ids in data2.items():
    # print(emp_id)
    # print(list_of_grant_ids)
    l = []
    for g_id in list_of_grant_ids:
        if g_id in data1:
            l.extend(data1[g_id])
    final_data[emp_id] = l

remove_empty_coll = []
for key, value in final_data.items():
    if len(value)==0:
        remove_empty_coll.append(key)

for value in remove_empty_coll:
    final_data.pop(value)
        


# print(final_data)

overall_ids = []
for key,value in final_data.items():
    # print(f"key: {key} , value: {value}")
    overall_ids.append(key)
    overall_ids.extend(value)


#Prepartion for data.json file format
# First prepare nodes
unique_ids_overall = list(set(overall_ids))

unique_names = []
unique_school_names=[]
df1 = df1.reset_index()
df2 = df2.reset_index()

def find_name(e_id):
    # print(e_id)
    if str(e_id).lower().startswith('u'):
        # print(df2.loc[df2["Employee ID"]==e_id,'Faculty name'])
        return df2.loc[df2["Employee ID"]==e_id,'Faculty name'].iloc[0]
    else:
        return df1.loc[df1["Co-investigator ID"]==e_id,'Co-investigator name'].iloc[0]
    

def find_school(e_id):
    if str(e_id).lower().startswith('u'):
        return df2.loc[df2["Employee ID"]==e_id,'School'].iloc[0]
    elif str(e_id).lower().startswith('e'):
        return df1.loc[df1["Co-investigator ID"]==e_id,'Institution'].iloc[0]

# print(unique_ids_overall)
for id in unique_ids_overall:
    unique_school_names.append(find_school(id))


for id in unique_ids_overall:
    unique_names.append(find_name(id))

# id_name_index = dict()
# for i in range(len(unique_names)):
#     id_name_index[i+1] = unique_names[i]




id_index = dict()
for i in range(len(unique_names)):
    id_index[(unique_names[i],unique_school_names[i])] = i+1

# print(f"Length of unique_ids: {len(unique_ids_overall)}")
# print(f"Length of unique_names: {len(unique_names)}")
# print(f"Length of unique_school: {len(unique_school_names)}")

# print(id_index)

nodes = []
for i in range(len(unique_names)):
    node = dict()
    # node["id"] = id_index[unique_names[i]]
    node["id"] = id_index[(unique_names[i],unique_school_names[i])]
    node["name"] = unique_names[i]
    node["school"] = unique_school_names[i]
    nodes.append(node)
nodes = [dict(t) for t in {tuple(d.items()) for d in nodes}]





# print(nodes)
# print("*"*100)
# print(final_data)

# Prepare for links
# result = np.transpose([np.tile(x, len(y)), np.repeat(y, len(x))])
# Format is source | target | weight

overall_links_ids = dict()

for key,values in final_data.items():

    # key = np.array([key])
    # values = np.array(values)
    # result = np.transpose([np.tile(key, len(values)), np.repeat(values, len(key))]).tolist()
    # print(result)
    counts = dict()
    for v in values:
        counts[v] = counts.get(v,0)+1
    overall_links_ids[key] = counts

print(overall_links_ids)

names_index_id = dict()
for e_id in unique_ids_overall:
    names_index_id[e_id] = find_name(e_id)

school_index_id = dict()
for e_id in unique_ids_overall:
    school_index_id[e_id] = find_school(e_id)

links = []
for key,values in overall_links_ids.items():
   
    # print(key)
    for inner_k,inner_v in values.items():
        if inner_v>1:
            for i in range(inner_v):
                link = dict()
                link["source"] = id_index[(names_index_id[key],school_index_id[key])]
                link["target"] = id_index[(names_index_id[inner_k],school_index_id[inner_k])]
                links.append(link)
                link1 = dict()

                link1["source"]  =id_index[(names_index_id[inner_k],school_index_id[inner_k])]
                link1["target"] = id_index[(names_index_id[key],school_index_id[key])]
                links.append(link1)

        else:
            link = dict()
            # print(f"Keys: {inner_k}, Values: {inner_v}")
            link["source"] = id_index[(names_index_id[key],school_index_id[key])]
            link["target"] = id_index[(names_index_id[inner_k],school_index_id[inner_k])]
            links.append(link)

            link1 = dict()
            link1["source"] = id_index[(names_index_id[inner_k],school_index_id[inner_k])]
            link1["target"] = id_index[(names_index_id[key],school_index_id[key])]
            links.append(link1)

# print(links)
# print(overall_links_ids)

d = dict()

d["nodes"] = nodes
d["links"] = links


with open("backend\Data\Json Files\Project External.json", "w") as outfile:
    json.dump(d, outfile)



# Luis Salvador-Carulla