# Mojave High School Person ID Finder for Google Apps

## Updating the Student Database

### Downloading the Student Database
1. Go to Campus Tools
2. Go to Ad Hoc Reporting > Data Viewer
3. Select the **student** Student IC Person ID Report
4. Leave the *Ad Hoc Filer* blank
5. Select CSV from the *Report Output Format*
6. Click *Generate Report*

### Convert the CSV file to a JSON file
1. Go to http://www.csvjson.com/csv2json
2. Click *Select a file...* to open the csv file downloaded from Infinite Campus
3. Change the headers per the following:
   * First Name --> firstName
   * Last Name --> lastName
   * Student Number --> studentNumber
   * Person ID --> personId
   * Birthdate --> birthdate
3. Click the *>* between the two gray boxes to convert the file
4. Copy the JSON text into a new text file
5. Save the file with the .json extenstion (it cannot be .txt)

### Updating the Firebase Database
1. Go to http://www.firebase.com
2. Click *Login to Legacy Console*
3. Login using Joseph May's *nv.ccsd.net* account
4. Click on the *MHS Person ID Finder* database
5. Click the *Import Data* button
6. Select the JSON file to import the data