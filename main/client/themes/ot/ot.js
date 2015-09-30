FlowComponents.define('otLayout', function (props) {
	this.set('content', props.content);
});

Template.otSLCotForum.events({
	'click [data-role="export"]': function (event) {
		var formId = $(event.currentTarget).data('form-id');
		Meteor.call('submissionsDownload', formId, function (error, result) {
			console.log(result);
			var jsonList = [];
			var categoryListEn = [
				"Bulk materials",
				"Electrical and telecommunications",
				"Freight and logistics",
				"Pipes and pumps",
				"Underground refuge",
				"Ventilation",
				"Construction and civil works",
				"Fire services",
				"Fuel systems",
				"Process and materials infrastructure",
				"Site services",
				"Drilling",
				"Underground mining fleet",
				"Ground support",
				"Professional services",
				"Steel"
			];
			var categoryList = {
				"Bulk materials":0,
				"Electrical and telecommunications":1,
				"Freight and logistics":2,
				"Pipes and pumps":3,
				"Underground refuge":4,
				"Ventilation":5,
				"Construction and civil works":6,
				"Fire services":7,
				"Fuel systems":8,
				"Process and materials infrastructure":9,
				"Site services":10,
				"Drilling":11,
				"Underground mining fleet":12,
				"Ground support":13,
				"Professional services":14,
				"Steel":15,
				"Их хэмжээгээр хэрэглэх материалууд":0,
				"Цахилгааны болон харилцаа холбооны хэрэгсэл":1,
				"Тээвэр зууч, ложистик":2,
				"Хоолой, Насос":3,
				"Далд уурхайн хоргодох байр":4,
				"Агааржуулалтын тоног төхөөрөмж, дагалдах үйлчилгээ":5,
				"Үйлдвэрлэлийн болон иргэний барилга байгууламж":6,
				"Галын аюулаас сэргийлэх үйлчилгээ, тоног төхөөрөмж":7,
				"Түлшний систем":8,
				"Боловсруулалт болон материалын дэд бүтэц":9,
				"Сайтын үйлчилгээ":10,
				"Өрөмдлөг, өрөмдлөгийн тоног төхөөрөмж, хэрэгсэл":11,
				"Хөдөлгөөнт тоног төхөөрөмж, дагалдах үйлчилгээ":12,
				"Гүний уурхайн тулгуур бэхэлгээний  материал":13,
				"Мэргэжлийн үйлчилгээ":14,
				"Метал хийц, төмөр":15
			};
			_.each(result, function (row, index) {
				var newItem1 = {
					"№": index + 1,
					"Company name": row.companyName,
					"City": row.addressStreet,
					"Country": row.addressCity,
					"Phone": row.addressCountry,
					"City": row.hqLocationCity,
					"Country": row.hqLocationCountry,
					"Address": row.nameLocation,
					"City": row.nearestCity,
					"Country": row.nearestCountry,
					"City": row.servicingCity,
					"Country": row.servicingCountry,
					"Percentage of Mongolian ownership": row.percentage ,
					"Employee number": row.howManyEmployees ,
					"Annual Turnover (in US$)": row.annualTurnover ,
					"Primary Activity": row.describes ,
					"Establishment date": row.establishmentDate ,
					"First name": row.keyFirst ,
					"Last name": row.keyLast ,
					"Position title": row.keyPosition ,
					"Email": row.keyEmail ,
					"Phone": row.keyPhoneL ,
					"Mobile": row.keyPhoneM
				};
				_.each(categoryListEn, function(value,key) {
					newItem1[value] = " ";
				});
				_.each(row.whatProducts, function(value){
					try{
						var catKey = value.split("$$$")[0].trim();
						var catValue = value.split("$$$")[1].trim();
						catKey = categoryList[catKey];
						catKey = categoryListEn[catKey];
						if(catValue){
							newItem1[catKey] = catValue;
						}
					}
					catch(e){
						console.log(e);
					}
				});
				var newItem2 = {
					"Top Client 1": row.topClient1,
					"Top Client 2": row.topClient2,
					"Top Client 3": row.topClient3,
					"Top Client 4": row.topClient4,
					"Top Client 5": row.topClient5,
					"Experience with OT/RT": row.workingOt,
					"Wish to partner (Yes/No)": row.wishPartner,
					"Wish to partner (Categories)": row.wishPartnerCheck,
					"Discussed to partner (Yes/No) ": row.wishPartner,
					"Discussed to partner (Categories)": row.alreadyDiscussionCheck,
					"Agree to share their info (Yes/No)": row.contactDetails,
					"How did they hear about the forum?": row.hearAbout
				}
				var newItem = _.extend(newItem1, newItem2)
				jsonList.push(newItem);
			});
			return FormBuilder.Helpers.downloadCSVFile('Expo Registrations.csv', jsonList);
		});
	}
});