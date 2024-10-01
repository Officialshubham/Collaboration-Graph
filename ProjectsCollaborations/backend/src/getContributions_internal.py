import numpy as np
import pandas as pd
import json
import os
from datetime import date

td = date.today()
df = pd.read_excel(f"backend\Data\Investgator Final Data\Project File Internal {td}.xlsx")
df = df[df['Years_new']>2017]

# df = df[(df['Status']=='Active') | (df['Status']=='Awarded') | (df['Status']=='Completed') | (df['Status']=='Completed-Pending Reports') | (df['Status']=='Offer Of Award')]

df['Employee ID'] = df['Employee ID'].str.lower()

df = df[df['Employee ID'].str.startswith('u')]

uniqueSchools= df['School'].unique()
uniqueSchools.sort()


g1 = df.groupby('Employee ID')
data1 = dict()

all_emp =[]

for emp_id, group in g1:

    group = group.reset_index()
    if emp_id not in all_emp:
        all_emp.append(emp_id)
    l=[]
    # print(emp_id)
    # print(group)
    for i in range(0,len(group)):
        l.append(group.iloc[i]['ARIES Grant ID'])

    data1[group.loc[group['Employee ID']==emp_id,'Employee ID'].iloc[0]] = list(set(l))



# print(len(data1))

# for key,value in data1.items():
#     print(f"EmployeeID: {key} , AriesProjectID: {value}")


g2 = df.groupby('ARIES Grant ID')
data2 =  dict()

for grant_id,group in g2:
    l=[]
    group = group.reset_index()
    # print(grant_id)
    # print(group)
    for i in range(0,len(group)):
        l.append(group.iloc[i]['Employee ID'])
    # data2[group.loc[group['Employee ID']=="u5289297",'Faculty name'].item()] = l
    data2[group.loc[group["ARIES Grant ID"]==grant_id,'ARIES Grant ID'].iloc[0]] = list(set(l))
    
# print(len(data2))


# overall_data= dict()
# for (empId,listOfAriesID), (grantId,listOfEmpId) in zip(data1.items(), data2.items()):
#     print(f"EmployeeID: {empId} , AriesGrantIDList: {listOfAriesID}")
#     print(f"AriesGrantID: {empId} , EmpIDList: {listOfAriesID}")
    
    # for g_id in listOfAriesID:
    #     print(g_id)
    #     if g_id==grantId:
    #         print("Inside")
    #         overall_data[empId] = listOfEmpId

def find(grant_id):
    for gid,list_emp_ids in data2.items():
        if grant_id==gid:
            return list_emp_ids

def remove_all_occurence(l, item): 
    res = [i for i in l if i != item] 
    return res 

overall_data= dict()

for empID,list_grant_ids in data1.items():
    all_emp_list = []
    for grant_id in list_grant_ids:
        list_empIds = find(grant_id)
        all_emp_list.extend(list_empIds)
    all_emp_list = remove_all_occurence(all_emp_list,empID)
    overall_data[empID] = all_emp_list

# print(overall_data)   
overall_employee_ids = []
for key,value in overall_data.items():
    # print(f"key: {key} , value: {value}")
    overall_employee_ids.append(key)
    overall_employee_ids.extend(value)

#Prepartion for data.json file format
# First prepare nodes
unique_emp_ids_overall = list(set(overall_employee_ids))

unique_names = []
unique_school_names=[]
df = df.reset_index()

def find_name(e_id):
    return df.loc[df["Employee ID"]==e_id,'Faculty name'].iloc[0]

def find_school(e_id):
    return df.loc[df["Employee ID"]==e_id,'School'].iloc[0]

for id in unique_emp_ids_overall:
    unique_school_names.append(find_school(id))

for id in unique_emp_ids_overall:
    unique_names.append(find_name(id))

# print(f"Length of unique_ids: {len(unique_emp_ids_overall)}")
# print(f"Length of unique_names: {len(unique_names)}")
# print(f"Length of unique_school: {len(unique_school_names)}")

# print(unique_names)

id_index = dict()
for i in range(len(unique_names)):
    id_index[unique_names[i]] = i+1

print(unique_names)
nodes = []
for i in range(len(unique_names)):
    node = dict()
    node["id"] = id_index[unique_names[i]]
    # node["id"] =  i
    node["name"] = unique_names[i]
    node["school"] = unique_school_names[i]
    nodes.append(node)
nodes = [dict(t) for t in {tuple(d.items()) for d in nodes}]
# print(nodes)

# Prepare for links
# result = np.transpose([np.tile(x, len(y)), np.repeat(y, len(x))])
# Format is source | target | weight

overall_links_ids = dict()

for key,values in overall_data.items():

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
for e_id in unique_emp_ids_overall:
    # print(df.loc[df["Employee ID"]==e_id,'Faculty name'])
    names_index_id[e_id] = find_name(e_id)

links = []
# print(overall_links_ids)
for key,values in overall_links_ids.items():
   
    # print(key)
    for inner_k,inner_v in values.items():
        if inner_v>1:
            for i in range(inner_v):
                link = dict()
                link["source"] = id_index[names_index_id[key]]
                link["target"] = id_index[names_index_id[inner_k]]
                links.append(link)
        else:
            link = dict()
            # print(f"Keys: {inner_k}, Values: {inner_v}")
            link["source"] = id_index[names_index_id[key]]
            link["target"] = id_index[names_index_id[inner_k]]
            links.append(link)
        # link = dict()
        # link["source"] = id_index[names_index_id[inner_k]]
        # link["target"] = id_index[names_index_id[key]]
        # links.append(link)

print(len(links))
# print(overall_links_ids)

d = dict()

d["nodes"] = nodes
d["links"] = links


with open("backend\Data\Json Files\Project Internal.json", "w") as outfile:
    json.dump(d, outfile)







# c=0
# overall_result = []
# for key,values in overall_data.items():
#     c+=1
#     key = np.array([key])
#     values = np.array(values)
#     # print(key)
#     # print(values)
#     result = np.transpose([np.tile(key, len(values)), np.repeat(values, len(key))]).tolist()
#     overall_result.extend(result)
#     # result = result.tolist()
#     # print(result)
#     # for r in result:
#     #     print(r)
#     #     overall_result.append(r)
#     if(c==2):
#         break
    
# print(overall_result)