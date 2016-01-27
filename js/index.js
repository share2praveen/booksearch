/* Filename: index.js
   @author: Praveen J
   @lastUpdated: Jan 24, 2016
*/
$(document).ready(function () {
	var bookHub = {
		bookList: null,
		bookCount: 0,
		selectedBookId: 1,
		isBookmarksOn: false,

		// init the app
		init: function () {
			var that = this;

			// get the book list
			$.ajax ({
				url: "https://capillary.0x10.info/api/books?type=json&query=list_books",
				method: "GET",
				contentType: "application/json",
				success: function (res) {
					that.bookList = res;
					that.getTotalBookCount ();
					that.getTotalBookmarkCount ();
					that.getBookTitles ();
					that.selectedBookId = that.bookList.books[0].id;
					that.getBookDetails (that.selectedBookId);
				},
				error: function (err) {

				}
			});
		},

		// Get the total no. of books available
		// @param 
		// return
		getTotalBookCount: function () {
			this.bookCount = this.bookList.books.length;
			$("#total-books").text(this.bookCount);
		},

		// Get the total no. of bookmarks available
		// @param 
		// return
		getTotalBookmarkCount: function () {
			var storedValue = localStorage.getItem ('bookhub');
			if (storedValue !== null) {
				var parsed = JSON.parse (storedValue);
				$("#total-bookmarks").text(parsed.books.length);

			} else {
				$("#total-bookmarks").text(0);
			}
			
		},
		// Get the list of all available book titles
		// @param 
		// return
		getBookTitles: function () {
			this.appendBookElements (this.bookList.books);
		},

		// Filter the list of books by Price in acsending order
		// @param 
		// return
		sortByPrice: function () {
			
			var arr = this.bookList.books.sort (function (a, b) {
				return parseFloat (a.price.replace("₹", '').trim()) - parseFloat (b.price.replace("₹", '').trim()); 
			});
			
			this.appendBookElements (arr);
		},

		// Filter the list of books by Rating in acsending order
		// @param 
		// return
		sortByRating: function () {


			var arr = this.bookList.books.sort (function (a, b) {
				return parseFloat (a.rating.trim()) - parseFloat (b.rating.trim()); 
			});
			
			this.appendBookElements (arr);

		},

		// Append the book titles to the book list in GUI
		// @param theArray 
		// return
		appendBookElements: function (theArray) {
			$("#book-title-list").empty();

			if (theArray.length === 0) {
				$("#book-title-list").append("<span class='title book-title'>No results found</span>");
			}

			for (var i=0; i<theArray.length; i++) {
				var name = "<a class='collection-item li-book-title' data-id="+ theArray[i].id +">"
							+ "<img src='images/book.png' alt='' class='square book-img'>"							 
							+ "<span class='title book-title'>" + theArray[i].name + "</span>"
							+ "<span class='new badge'>" + theArray[i].price +"</span>"
							+ "</a>";
				$("#book-title-list").append(name);
			}

		},

		// Get the book details using the id
		// @param theBookId 
		// return
		getBookDetails: function (theBookId) {
			this.selectedBookId =theBookId;
			for (var i=0; i<this.bookCount; i++) {
				if (this.bookList.books[i].id == theBookId) {

					$("#book-desc").text (this.bookList.books[i].description);
					$("#book-cover").attr ("src", this.bookList.books[i].image);
					$("#book-publisher").text (this.bookList.books[i].details.Publisher);
					$("#book-isbn").text (this.bookList.books[i].details.ISBN);
					$("#book-binding").text (this.bookList.books[i].details.Binding);
					$('#book-rating').raty('score', parseFloat(this.bookList.books[i].rating));
					//$("#book-rating").text (this.bookList.books[i].description);
				}

			}
		},


		// Search from the list of available books in the book list
		// for now the search lookup is overall for the provided JSON
		// @param  theKeyword
		// return
		search: function (theKeyword) {
			

			var matches = [];
			
			for (var i=0; i<this.bookCount; i++) {
				var word = this.bookList.books[i];
				for (k in word) {

					if (typeof word[k] !== null && typeof word[k] === "object") {
						for (v in word[k]) {
							if (word[k][v].toLowerCase().indexOf(theKeyword.toLowerCase()) > -1) {
								// for (var j=0; j<matches.length; j++) {
								// 	if (matches[j].name === word.name) {
										matches.push (word);
												
								// 	}
								// }
							}		
						}
					} else {
						if (word[k].toLowerCase().indexOf(theKeyword.toLowerCase()) > -1) {
							// for (var j=0; j<matches.length; j++) {
							// 	if (matches[j].name === word.name) {
									matches.push (word);		
											
							// 	}
							// }
						}
					}
				}
			}


			var uniqueArray = matches.filter(function(v, i) {
			    return matches.indexOf(v) == i;
			}); 		


			this.appendBookElements (uniqueArray);

		},

		// Get all books from the bookmarked by the user
		// @param  
		// return
		getAllBookMarks: function () {
			var storedValue = localStorage.getItem ('bookhub');
			
			if (storedValue !== null) {
				var parsed = JSON.parse (storedValue);
				this.appendBookElements (parsed.books);

			} else {
				//error
				console.log ("err");
			}
		},

		// Set bookmarked book details in Localstorage
		// @param  
		// return
		setBookMarksById: function () {
			this.newBookmark = "";
			this.isBookMarkedAlready = false;
			for (var i=0; i<this.bookCount; i++) {
				if (this.bookList.books[i].id == this.selectedBookId) {
					 this.newBookmark= this.bookList.books[i];		
				}
			}

			

			var storedValue = localStorage.getItem ('bookhub');
			
			if (storedValue !== null) {

				var parsed = JSON.parse (storedValue);
				for (var i=0; i<parsed.books.length; i++) {
					if (parsed.books[i].id == this.selectedBookId) {
						this.isBookMarkedAlready = true;
						Materialize.toast('Already add to your bookmarks!', 4000)
						break;		
					}
				}

				if (!this.isBookMarkedAlready) {
					parsed.books.push (this.newBookmark);
					localStorage.setItem ('bookhub', JSON.stringify(parsed));
					Materialize.toast('Added to your bookmarks!', 4000)
				}	

			} else {
				var newBookmark = {};
				newBookmark.books = [];
				newBookmark.books.push (this.newBookmark);
				
				localStorage.setItem ('bookhub', JSON.stringify(newBookmark));				

			}

			this.getTotalBookmarkCount ();
	
		},

		getAllBookMarksById: function () {

		}
	};

	bookHub.init();

	// sort by price
	$("#sort-price").on ('change', function () {
		bookHub.sortByPrice();
	});

	// sort by rating
	$("#sort-rating").on ('change', function () {
		bookHub.sortByRating();
	});

	// search
	$("#search").on ('keydown', function (e) {

		// if (e.keyCode === 13){

			var keyword = $(this).val().trim();
			bookHub.search(keyword);
		// }
	});

	$("#book-title-list").on ("click",".li-book-title", function () {
		bookHub.getBookDetails ($(this).data("id"));		
	});

	$("#all-bookmarks").on ("click", function () {
		if (bookHub.isBookmarksOn) {
			bookHub.isBookmarksOn = false;
			bookHub.getBookTitles ();
			$("#bookmark-icon").css("color", "#ccc");
		} else {
			bookHub.isBookmarksOn = true;
			bookHub.getAllBookMarks ();	
			$("#bookmark-icon").css("color", "#56853B");
		}
			
	});

	$("#new-bookmark").on ("click", function () {
		bookHub.setBookMarksById ();
	});

	$("#share-btn").on ("click", function () {
		Materialize.toast('Not yet Implemented', 4000)
	});

$('#book-rating').raty();
});