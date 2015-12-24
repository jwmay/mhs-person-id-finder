(function() {
    var app = angular.module('personIdFinder', ['firebase']);

    app.controller('LookupController', function($timeout) {
        var _this = this;
        
        // Usage instructions to display to user
        var instructions = 'Enter your name and student number above to find your username';
        
        // Flag to control display of the spinning wheel
        this.searching = false;
        
        // Object to store the user info, a flag to display the user info, and a message before
        // the first search is initiated
        this.user = {
            firstName: '',
            studentNumber: '',
            personId: '',
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
            query.on('value', function(snapshot) {
                $timeout(function() {
                    var data = snapshot.val();
                    console.log(data);
                    
                    // Disable the spinner
                    _this.searching = false;
                    
                    // Display resuts if found in the Firebase database, otherwise, display a message
                    if (data !== null && data !== undefined) {
                        for (var key in data) {
                            _updateUser(data[key].personId);
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
            _this.user.studentNumber = '';
            _this.user.personId = '';
            _this.user.found = false;
            _this.user.message = instructions;
        };
        
        // Function to update the person ID once found in the Firebase database
        var _updateUser = function(personId) {
            _this.user.personId = personId;
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
})();