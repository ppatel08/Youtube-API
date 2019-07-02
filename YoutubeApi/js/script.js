angular.module('youtubePlayer', [])
	.controller('youtubePlayerController', ['youtubeAPI', '$scope', '$sce', function (youtubeAPI, $scope, $sce) {
		var vm = this;

		$scope.searchMovie;
		vm.playerUrl;
		vm.selectedMovie;
		vm.movies = [];
		vm.maxResults = 6;

		vm.showMenu = false;

		youtubeAPI.searchVideos('avenger', vm.maxResults).then(function(trailers) {
			angular.forEach(trailers, function(trailer, index) {
				youtubeAPI.getStats(trailer.id.videoId).then(function (stats) {
					vm.movies.push({
						videoId: trailer.id.videoId,
						channel: trailer.snippet.channelTitle,
						title: trailer.snippet.title,
						description: trailer.snippet.description,
						thumbnail: trailer.snippet.thumbnails.high,
						stats: stats
					});
					if (!vm.selectedMovie) {
						vm.selectedMovie = vm.movies[0];
						vm.playerUrl = $sce.trustAsResourceUrl('https://www.youtube.com/embed/'+ vm.selectedMovie.videoId +'?rel=0');
					}
				});
			});
		});

		vm.playMovie = function(movie, videoId) {
			vm.selectedMovie = movie;
			vm.playerUrl = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + vm.selectedMovie.videoId + '?rel=0');
			vm.showMenu = false;
		}

		vm.search = function(query) {
			youtubeAPI.searchVideos(query, vm.maxResults).then(function(response){
				vm.movies = [];
				angular.forEach(response, function (trailer, index) {
					youtubeAPI.getStats(trailer.id.videoId).then(function (stats) {
						vm.movies.push({
							videoId: trailer.id.videoId,
							channel: trailer.snippet.channelTitle,
							title: trailer.snippet.title,
							description: trailer.snippet.description,
							thumbnail: trailer.snippet.thumbnails.high,
							stats: stats
						});
						if (vm.movies[0].videoId) {
							vm.selectedMovie = vm.movies[0];
							vm.playerUrl = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + vm.selectedMovie.videoId + '?rel=0');
						}
					});
				});
			});
		}
	}])

	.factory('youtubeAPI', ['$window', '$http', '$q', function (window, http, $q) {
		var apiBase = 'https://www.googleapis.com/youtube/v3/';
		var apiKey = 'AIzaSyDJ6288fsxOZ_QNRR193RIQJaQiIMAO7tc';
		var api = this;

		api.getVideos = getVideos;
		api.searchVideos = searchVideos;
		api.getStats = getStats;

		function getVideos(part, chart, page) {
			var defer = $q.defer();
			var url = apiBase + 'videos?type=video&part=' + part + '&chart=' + chart + '&key=' + apiKey;
			http.get(url).then(function (success) {
				console.log(success.data);
				defer.resolve(success.data.items);
			}, function (err) {
				console.log(err);
				defer.reject(err);
			});
			return defer.promise;
		}

		function searchVideos(query, maxResults) {
			var defer = $q.defer();

			var url = apiBase + 'search?type=video&part=snippet&q=' + query + '&maxResults='+ maxResults +'&key=' + apiKey;
			http.get(url).then(function (success) {
				defer.resolve(success.data.items);
			}, function (err) {
				defer.reject(err);
			});
			return defer.promise;
		}

		function getStats(videoId) {
			var defer = $q.defer();

			var url = apiBase + 'videos?type=video&part=statistics&id=' + videoId + '&key=' + apiKey;
			http.get(url).then(function (success) {
				defer.resolve(success.data.items[0].statistics);
			}, function (err) {
				defer.reject(err);
			});
			return defer.promise;
		}
		return api;
	}]);