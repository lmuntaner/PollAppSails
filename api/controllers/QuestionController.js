/**
 * QuestionController
 *
 * @description :: Server-side logic for managing questions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
	'index': function (req, res) {
		var userIp = req.connection.remoteAddress;
		
		function renderQuestion (err, questions) {
			var num_questions = questions.length;
			var randomIndex = parseInt((Math.random() * questions.length) + 1);
		
			Question.findOne(randomIndex).exec(function (err, question) {
				if (err) return next(err);
							
				Question.findOne(randomIndex).populate('answers').exec(function (err, answersObj) {
					res.view({
						question: question,
						answers: answersObj.answers
					});				
				})
			});
		}
		
		QuestionIp.find({ ip: userIp }).exec( function (err, questionIps) {
			var respondedIds = [];
			questionIps.forEach( function (questionIp) {
				respondedIds.push(questionIp.question);
			});
			Question.find().exec(function (err, questions) {
			var num_questions = questions.length;
			var randomIndex = parseInt((Math.random() * questions.length) + 1);
			
			while (respondedIds.some(function (id) { return id == randomIndex })) {
				if (num_questions === respondedIds.length) {
					res.view({
						question: {},
						answers: {}
					});
					return;
				}
				randomIndex = parseInt((Math.random() * questions.length) + 1);
			}
		
			Question.findOne(randomIndex).exec(function (err, question) {
				if (err) return next(err);
							
				Question.findOne(randomIndex).populate('answers').exec(function (err, answersObj) {
					res.view({
						question: question,
						answers: answersObj.answers
					});				
				})
			});
		});			
		});
		
	},
	
	'new': function (req, res) {
		res.view({
			user: req.session.User
		});
	},
	
	'create': function (req, res) {
		if (!req.session.User) {
			res.redirect('/');
			return;
		}

		Question.create({ title: req.param('question').title, user: req.param('question').user }).exec(function (err, question) {
			if (err) {
				console.log(err);
				res.redirect('/');
				return;
			}
			
			req.param('answer').title.forEach( function (title) {
				Answer.create({ title: title, question: question.id }).exec(function (err, answer) {
					console.log(answer);
				});
			})
			res.redirect('/user/show/' + req.session.User.id);
		});
		
	},
	
  show: function(req, res, next) {
    Question.findOne(req.param('id'), function (err, question) {
      if (err) return next(err);

			Question.findOne(req.param('id')).populate('answers').exec(function(err, answersObj) {
				if (err) {
					console.log(err);
					return;
				}
				
				var answers = answersObj.answers;
				answers.map(function (answer) {
					Answer.result(answer.id, answer);
				});
				
				setTimeout( function () {
		      res.view({
		        question: question,
						answers: answers
		      });					
				}, 500);
			})

    });
  },
	
};

