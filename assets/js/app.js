(function() {
    var app = angular.module('personIdFinder', ['firebase']);

    app.controller('LookupController', function($timeout, $filter) {
        var _this = this;
        
        // Usage instructions to display to user
        var instructions = 'Enter your last name, student number, and date of birth above to find your username';
        
        // Flag to control display of the spinning wheel while searching and loading user data
        this.searching = false;
        
        // Object to store the user info, a flag to display the user info, and a message before
        // the first search is initiated
        this.user = {
            firstName: '',
            lastName: '',
            studentNumber: '',
            personId: '',
            birthdate: '',
            password: '',
            found: false,
            message: instructions
        };
        
        // Locate the user in the Firebase database and update the user object
        this.search = function() {
            
            // Reset the results display for each search
            _this.user.found = false;

            // Display spinner while search is performed on Firebase database
            _this.searching = true;

            // Firebase database where studentNumber-personId data is stored
            var ref = new Firebase('https://mhs-person-id-finder.firebaseio.com/');
            
            // Query the Firebase database with the student number
            var query = ref.orderByChild('studentNumber').equalTo(Number(this.user.studentNumber));
            
            // Process the query results
            query.once('value', function(snapshot) {
                $timeout(function() {
                    var data = snapshot.val();
                    console.log(data);
                    
                    // Disable the spinner
                    _this.searching = false;
                    
                    // Display resuts if found in the Firebase database, otherwise, display a message
                    if (data !== null && data !== undefined) {
                        for (var key in data) {
                            // Extract data
                            var firstName = data[key].firstName;
                            var lastName = data[key].lastName;
                            var personId = data[key].personId;
                            var dob = $filter('mhsDateFilter')(data[key].birthdate);
                            var password = $filter('mhsPasswordFilter')(data[key].birthdate);
                            
                            // Verifty that the last name matches
                            if ($filter('lowercase')(_this.user.lastName) === $filter('lowercase')(lastName)) {
                                // Verify that the birthdate matches
                                if (_this.user.birthdate === dob) {
                                    _updateUser(firstName, personId, password);
                                }
                                else {
                                    _this.user.message = 'Date of birth does not match record';
                                }
                            }
                            else {
                                _this.user.message = 'Last name does not match record';
                            }
                        }
                    }
                    else {
                        _this.user.message = 'No user found with that student number';
                    }
                });
            }, function(errorObject) {
                // Error handling
                console.log('The read failed: ' + errorObject.code);
                _this.user.message = 'There was an error processing your request.  Please try again later.';
            });
        };
        
        // Clear the input fields and the data stored in the user object
        this.reset = function() {
            _this.user.firstName = '';
            _this.user.lastName = '';
            _this.user.studentNumber = '';
            _this.user.personId = '';
            _this.user.birthdate = '';
            _this.password = '';
            _this.user.found = false;
            _this.user.message = instructions;
        };
        
        // Function to update the person ID once found in the Firebase database
        var _updateUser = function(firstName, personId, password) {
            _this.user.firstName = firstName;
            _this.user.personId = personId;
            _this.user.password = password;
            _this.user.found = true;
        };
    });
    
    // Filter the user's first name according to the GAFE guidelines:
    //  * Character limit of 8 letters
    //  * No spaces, hyphens, or apostrophes (although, they count towards the character limit)
    //  * Lowercase only
    app.filter('username', function($filter) {
        return function(name) {
            // Shorten the name to 8 characters includind special characters and spaces
            var limitToEight = $filter('limitTo')(name, 8);
            
            // Remove special characters and spaces
            var noSpecialChars = limitToEight.replace(/[^a-zA-Z]/g, '');
            
            // Convert all characters to lowercase
            var lowercaseName = $filter('lowercase')(noSpecialChars);
            return lowercaseName;
        };
    });
    
    // Filter the birthdate string from MM/DD/YYYY to MMDDYY
    app.filter('mhsDateFilter', function() {
        return function(date) {
            // Remove the slashes
            var noSlashes = date.split('/');

            // Create 2-digit year            
            noSlashes[2] = noSlashes[2].slice(2);
            
            // Return the 6-digit date as a string
            return noSlashes.join('');
        };
    });

    // Filter the birthdate to construct the temporary password as YYYYMMDD
    app.filter('mhsPasswordFilter', function() {
        return function(date) {
            // Remove the slashes
            var noSlashes = date.split('/');

            // Create and return the password as YYYYMMDD
            var password = noSlashes[2] + noSlashes[0] + noSlashes[1];
            return password;
        };
    });
})();