import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import json
import os

headers = {'User-Agent' : 'Mozilla/5.0'}
custom_url = 'https://www.ultrapc.ma/21-processeurs?page=&content_only=1&infinitescroll=1'

request = requests.get(custom_url, headers)

soup = BeautifulSoup(request.text, 'html.parser')

result_paragraph = soup.find("div", class_="total-products float-left hidden-sm-down").find('p').text
number_of_result = 0

print(os.getcwd())
# Calculate the number of items in total
for i in range(len(result_paragraph)):
    if(result_paragraph[i].isnumeric()):
        result_count = ""
        for j in range(i, len(result_paragraph)):
            if(result_paragraph[j] != " "):
                result_count = result_count + result_paragraph[j]
            else:
                break
        number_of_result = int(result_count)
        break

categories = {"Processor" : "https://www.ultrapc.ma/21-processeurs?content_only=1&infinitescroll=1&page=",
"Motherboard" : "https://www.ultrapc.ma/28-cartes-meres?content_only=1&infinitescroll=1&page=",
"Watercooling" : "https://www.ultrapc.ma/44-refroidissement?content_only=1&infinitescroll=1&page=",
"GPU" : "https://www.ultrapc.ma/39-cartes-graphiques?content_only=1&infinitescroll=1&page=",
"RAM" : "https://www.ultrapc.ma/35-memoire-vive-pc?content_only=1&infinitescroll=1&page=",
"SSD_&_HDD" : "https://www.ultrapc.ma/34-disques-durs-et-ssd?content_only=1&infinitescroll=1&page=",
"PSU" : "https://www.ultrapc.ma/43-alimentations-pc?content_only=1&infinitescroll=1&page=",
"Case" : "https://www.ultrapc.ma/48-boitier-pc?content_only=1&infinitescroll=1&page=",
"Sound_Card" : "https://www.ultrapc.ma/53-cartes-son?content_only=1&infinitescroll=1&page="}

# Scraps the items off the website
for category_name, category_url in categories.items():
    if not os.path.exists("Frontend/pc-config-maroc/src/Data/" + category_name + "_data.json"):  
        products = []

        # Displays the number of items in total
        print(time.strftime("%H:%M:%S"),"- Searching ", category_name)
        print(time.strftime("%H:%M:%S"),"- Searching throuht URL : ", custom_url)
        if(number_of_result > 1):
            print(time.strftime("%H:%M:%S"),"- There are ", number_of_result, "items in total.")
        else:
            print(time.strftime("%H:%M:%S"),"- There is ", number_of_result, "item in total.")

        for k in range(number_of_result // 32):
            
            print(time.strftime("%H:%M:%S"),"- Searching page number ", k + 1," ", category_url + str(k + 1))

            request = requests.get(category_url + "&page=" + str(k + 1), headers)

            soup = BeautifulSoup(request.text, 'html.parser')

            l = 0
            for product_card in soup.find_all('div', class_="product-block clearfix"):
                stats = {}
                number_of_result += 1
                title_text = product_card.find('h3').text

                complementary_url = product_card.find('a')['href']
                complementary_request = requests.get(complementary_url, headers)

                complementary_soup = BeautifulSoup(complementary_request.text, 'html.parser')
                complete_title = complementary_soup.find('h1', class_="product-title").text
                print(time.strftime("%H:%M:%S"),"- Full title : ", complete_title)
                
                alt = 0
                fields = 0
                info_name = ""
                info_value = ""
                stats["Name"] = complete_title
                for info_row in complementary_soup.find('dl', class_="data-sheet d-flex flex-wrap justify-content-between m-0").contents:
                    if info_row != '\n':
                        fields += 1

                        if alt == 0:
                            info_name = info_row.text
                        elif alt == 1:
                            info_value = info_row.text
                        else:
                            stats[info_name] = info_value
                            alt = 0
                            info_name = info_row.text

                        alt += 1
                price = product_card.find("span", class_="price").text
                price = price.replace("MAD", "").replace(",", ".").replace(" ", "")

                stats["Price"] = float(price)
                stats["ID"] = i

                i += 1

                if fields >= 8 and float(price) > 0:
                    products.append(stats)

        json_file = open("Frontend/pc-config-maroc/src/Data/" + category_name + "_data.json", "w", encoding="utf-8")
        json.dump(products, json_file, indent=4, ensure_ascii=False)
        json_file.close()
    else:
        print(time.strftime("%H:%M:%S"),"- ", category_name, "data already exists, proceeding to the next category...")

print(time.strftime("%H:%M:%S"),"- Finished scrapping items successfully.")