import json

# Country code to full name mapping
country_map = {
    "AE": "United Arab Emirates", "AR": "Argentina", "AT": "Austria", "AU": "Australia",
    "BA": "Bosnia and Herzegovina", "BE": "Belgium", "BG": "Bulgaria", "BR": "Brazil",
    "BY": "Belarus", "CA": "Canada", "CH": "Switzerland", "CL": "Chile", "CN": "China",
    "CO": "Colombia", "CS": "Czechoslovakia", "CZ": "Czech Republic", "DE": "Germany",
    "DK": "Denmark", "DO": "Dominican Republic", "EE": "Estonia", "ES": "Spain",
    "FI": "Finland", "FO": "Faroe Islands", "FR": "France", "GB": "United Kingdom",
    "GL": "Greenland", "GR": "Greece", "HK": "Hong Kong", "HR": "Croatia", "HU": "Hungary",
    "ID": "Indonesia", "IE": "Ireland", "IL": "Israel", "IN": "India", "IR": "Iran",
    "IS": "Iceland", "IT": "Italy", "JM": "Jamaica", "JP": "Japan", "KR": "South Korea",
    "LI": "Liechtenstein", "LT": "Lithuania", "LU": "Luxembourg", "LV": "Latvia",
    "MK": "North Macedonia", "ML": "Mali", "MX": "Mexico", "MY": "Malaysia", "NG": "Nigeria",
    "NL": "Netherlands", "NO": "Norway", "NZ": "New Zealand", "PE": "Peru", "PH": "Philippines",
    "PK": "Pakistan", "PL": "Poland", "PR": "Puerto Rico", "PT": "Portugal", "RE": "Reunion",
    "RO": "Romania", "RS": "Serbia", "RU": "Russia", "SA": "Saudi Arabia", "SE": "Sweden",
    "SG": "Singapore", "SI": "Slovenia", "SK": "Slovakia", "SU": "Soviet Union", "TH": "Thailand",
    "TR": "Turkey", "TW": "Taiwan", "TZ": "Tanzania", "UA": "Ukraine", "UM": "United States Minor Outlying Islands",
    "US": "United States", "UY": "Uruguay", "VE": "Venezuela", "VI": "Virgin Islands", "VN": "Vietnam",
    "XC": "Custom Code", "XE": "Custom Code", "XG": "Custom Code", "XW": "Custom Code",
    "YU": "Yugoslavia", "ZA": "South Africa"
}

def update_country_codes(input_file, output_file):
    # Read the JSON data from file
    with open(input_file, 'r') as f:
        data = json.load(f)

    # Iterate over each entry and update the country code to the full country name
    for entry in data:
        country_code = entry.get('country')
        if not country_code or country_code not in country_map:
            entry['country'] = 'Unknown'
        else:
            entry['country'] = country_map[country_code]

    # Write the updated data back to a new JSON file
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    input_file = '../../../data/json/album.json'
    output_file = 'updated_album.json'
    update_country_codes(input_file, output_file)
    print(f"Updated JSON has been saved to {output_file}")