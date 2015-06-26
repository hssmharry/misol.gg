$('body').on('click', '#searchBtn', function(e){
	var searchName = $.trim($('#searchName').val()).replace(/ /gi, '');

	if(searchName != '' && searchName) {
		searchSummoner(searchName);
	} else {
		alert('소환사명을 정확히 입력해주세요');
	}
});

$('body').on('click', '.icon img', function(e) {
	clickEvent.imgClickEvent(e);
});

var clickEvent = {
	imgClickEvent : function(e){
		var left 	= $(e.target).offset().left + 35;
		var top 	= $(e.target).offset().top + 35;
		var altText = $(e.target).attr('alt');
		var title 	= $(e.target).attr('title');

		if($(e.target).css('display') == 'none') {
			$('.spellAlt .title').text(title);
			$('.spellAlt .altText').text(altText);
			$('.spellAlt').show(500).css({'top':top, 'left':left});
		} else{
			$('.spellAlt').hide(500);
		}
	}
};

var getUrl = function(region) {
	var apiKey 			= '2211732e-b8fe-4182-b2ee-f083aa0b4b72';

	var defaultUrl 		= 'https://' + region + '.api.pvp.net/api/lol/' + region + '/';
	var staticDataUrl 	= 'https://global.api.pvp.net/api/lol/static-data/' + region + '/';

	var nameUrl 		= 'v1.4/summoner/by-name/';
	var gameUrl 		= 'v1.3/game/by-summoner/';
	var championUrl 	= 'v1.2/champion/';
	var spellUrl		= 'v1.2/summoner-spell/';
	var itemUrl			= 'v1.2/item/';

	return {
		getNameUrl : function(summonerName) {
			return defaultUrl + nameUrl + summonerName + '?api_key=' + apiKey;
		},
		getGameUrl : function(summonerId) {
			return defaultUrl + gameUrl + summonerId + '/recent?api_key=' + apiKey;
		},
		getChampionUrl : function(championId) {
			return staticDataUrl + championUrl + championId + '?api_key=' + apiKey + '&champData=image';
		},
		getSpellUrl : function(spellId) {
			return staticDataUrl + spellUrl + spellId + '?api_key=' + apiKey;
		},
		getItemUrl : function(itemId) {
			return staticDataUrl + itemUrl + itemId + '?api_key=' + apiKey + '&itemData=all';
		}
	}
};

var makeChampData = function(champId, thisTable){
	var url = getUrl('kr').getChampionUrl(champId);
	var champImgUrl = 'http://ddragon.leagueoflegends.com/cdn/5.2.1/img/champion/';

	$.ajax({
        url:url,
        success:function(data){
        	var champName = data.name;
    		thisTable.find('.champName').html(champName);
    		thisTable.find('.champIcon').html('<img src="' + champImgUrl + data.image.full + '" />');
        },
        error:function(e){
        }
    });
};

var makeSpellIcon = function(spellArr, thisTable){
	var url = '';
	var spellImgUrl 	= 'http://ddragon.leagueoflegends.com/cdn/5.2.1/img/spell/';
	var spellImgHtml 	= '';

	$.each(spellArr, function(index, value){
		url = getUrl('kr').getSpellUrl(value);
		$.ajax({
	        url:url,
	        success:function(data){
	        	spellImgHtml += '<img src="' + spellImgUrl + data.key + '.png' + '" alt="' + data.description + '" title="' + data.name + '" /><br />';
	        },
	        error:function(e){
	        },
	        beforeSend:function(){
	        	$('.loadingImgWrap').show();
	        },
	        complete:function(){
	        	thisTable.find('.spellIcon').html(spellImgHtml);
	    		$('.loadingImgWrap').hide();
	        }
	    });
	});
};

var makeGameList = function(gameData) {
	$('#gameListWrap').text('');
	$.each(gameData.games, function(index, value) {
		$('#gameListWrap').append(gameListForm());

		var thisTable 	= $('.gameListTable:eq(' + index + ')');
		var gameStats 	= value.stats;

		makeChampData(value.championId, thisTable);
		makeSpellIcon([value.spell1, value.spell2], thisTable);

		var createDate	= new Date();

		var playTime	= gameStats.timePlayed;
		var createDateMilli	= value.createDate;
		createDate.setTime(createDateMilli);
		var playTimeHtml = parseInt(playTime/60) + '분 ' + (playTime%60) + '초';
		var createTimeHtml = createDate.getFullYear() +'-'+ (createDate.getMonth()+1) +'-'+ createDate.getDate() + '　';
		createTimeHtml += createDate.getHours() + ':' + createDate.getMinutes();

		var itemList 	= [gameStats.item0, gameStats.item1, gameStats.item2, gameStats.item3, gameStats.item4, gameStats.item5];
		makeItemlIcon(itemList, thisTable);

		var detailInfoHtml = '';
		var gameLevel	= gameStats.level;
		var minionsKill	= gameStats.minionsKilled;
		var EnemyJungle = gameStats.neutralMinionsKilledEnemyJungle; EnemyJungle? '' : EnemyJungle = 0 ;
		var myJungle 	= gameStats.neutralMinionsKilledYourJungle; myJungle? '' : myJungle = 0;
		var killsArr	= [gameStats.doubleKills, gameStats.tripleKills, gameStats.quadraKills, gameStats.pentaKills];
		var killRecord	= '';

		if(gameStats.pentaKills) {
			killRecord = '펜타킬';
		} else if(gameStats.quadraKills) {
			killRecord = '쿼드라킬';
		} else if(gameStats.tripleKills) {
			killRecord = '트리플킬';
		} else if(gameStats.doubleKills) {
			killRecord = '더블킬';
		}

		detailInfoHtml += '<span class="levelTag">Level : ' + gameLevel + '</span><br />';
		detailInfoHtml += '<span class="csTag">CS : ' + minionsKill + ' + ' + (EnemyJungle + myJungle);
		detailInfoHtml += ' (' + myJungle + '/' + EnemyJungle + ')</span><br />';
		detailInfoHtml += '<span class="killTag">' + killRecord + '</span>';

		var result = '승';
		if(!value.stats.win) {
			result = '패';
			thisTable.addClass('lose');
		}

		var kdaArr		= [ gameStats.championsKilled ? gameStats.championsKilled : 0,
							gameStats.numDeaths ? gameStats.numDeaths : 0,
							gameStats.assists ? gameStats.assists : 0];
		var kdaHtml		=  kdaArr[0] + ' / ' + kdaArr[1] + ' / ' + kdaArr[2];
		kdaHtml		   += '</br><div class="kdaLabel">' + ((kdaArr[0] + kdaArr[2]) / kdaArr[1]).toFixed(1) + '</div>';

		thisTable.find('.rankType').html(value.subType);
		thisTable.find('.createTime').html(createTimeHtml);
		thisTable.find('.playTime').html(playTimeHtml);
		thisTable.find('.gameResult').html(result);
		thisTable.find('.detailInfo').html(detailInfoHtml);

		thisTable.find('.kda').html(kdaHtml);
	});
};

var makeItemlIcon = function(itemList, thisTable){
	var itemHtml = '';
	itemObj.callBack(itemList, 0, thisTable, itemHtml);
};

var itemObj = {
	itemImgUrl 	: 'http://ddragon.leagueoflegends.com/cdn/5.2.1/img/item/',
	callBack	: function(itemList, index, thisTable, itemHtml){
		var url = '/noItem';
		var addClass = '';

		if(itemList[index]){
			url = getUrl('kr').getItemUrl(itemList[index]);
		}

		if(index == 3){
			addClass = ' br';
		}

		$.ajax({
	        url:url,
	        success:function(data){
	        	if(data.id){
	        		itemHtml += '<div class="itemWrap' + addClass + '">';
	        		itemHtml += '<img src="' + itemObj.itemImgUrl + data.image.full + '" alt="' + data.sanitizedDescription + '" title="' + data.name + '" />';
	        		itemHtml += '</div>';
	        	} else{
	        		itemHtml += '<div class="itemWrap' + addClass + '"><div class="noItem"></div></div>';
	        	}

	    		switch(index){
		    		case 5	: thisTable.find('.itemList').html(itemHtml); break;
		    		default	: index ++; itemObj.callBack(itemList, index, thisTable, itemHtml);
	    		}
	        },
	        beforeSend:function(){
	    		$('.loadingImgWrap').show();
	        },
	        complete:function(){
	    		$('.loadingImgWrap').hide();
	        }
	    });
	}
};

var gameListForm = function(){
	var gameListHtml = '';

	gameListHtml += '<table class="gameListTable">';
	gameListHtml += '	<tr class="title">';
	gameListHtml += '		<td><span class="rankType"></span></td>';
	gameListHtml += '		<td class="miniTd"></td>';
	gameListHtml += '		<td><span class="champName"></span></td>';
	gameListHtml += '		<td><span class="createTime"></span></td>';
	gameListHtml += '		<td><span class="playTime"></span></td>';
	gameListHtml += '		<td class="lastTd"><span class="gameResult"></span></td>';
	gameListHtml += '	</tr>';
	gameListHtml += '	<tr class="gameData">';
	gameListHtml += '		<td><span class="champIcon"></span></td>';
	gameListHtml += '		<td class="miniTd"><span class="spellIcon icon"></span></td>';
	gameListHtml += '		<td><span class="kda"></span></td>';
	gameListHtml += '		<td><span class="detailInfo"></span></td>';
	gameListHtml += '		<td><span class="itemList icon"></span></td>';
	gameListHtml += '		<td class="lastTd"><span class="moreDetail">▼</span></td>';
	gameListHtml += '	</tr>';
	gameListHtml += '</table>';

	return gameListHtml;
};

var searchSummoner = function(searchName) {
	$('.defaultMessage').hide();
	var url = getUrl('kr').getNameUrl(searchName);;

	$.ajax({
        url:url,
        success:function(data){
  		  getGameData(data[searchName]);
        },
        error:function(e){
        },
        beforeSend:function(){
        	$('.loadingImgWrap').show();
        },
        complete:function(){
    		$('.loadingImgWrap').hide();
        }
    });
};

var getProfileIconImg = function(iconId){
	var profileIconUrl = 'http://ddragon.leagueoflegends.com/cdn/5.2.1/img/profileicon/' + iconId + '.png';
	var profileIconHtml = '<img src="' + profileIconUrl + '" />';

	return profileIconHtml;
};


var getGameData = function(summonerData){
	console.log(summonerData.id);
	var url = getUrl('kr').getGameUrl(summonerData.id);

	$.ajax({
        url:url,
        success:function(data){
  		  makeGameList(data);
  		  makeSummonerInfo(summonerData);
        },
        error:function(e){
        },
        beforeSend:function(){
        	$('.loadingImgWrap').show();
        },
        complete:function(){
    		$('.loadingImgWrap').hide();
        }
    });
};

var makeSummonerInfo = function(data){
	$('.summonerInfoWrap').text('').html(summonerInfoForm());
	$('.summonerIcon').html(getProfileIconImg(data.profileIconId));
};


var summonerInfoForm = function(){
	var summonerInfoHtml = '';

	summonerInfoHtml += '<div class="summonerIcon"></div>';
	summonerInfoHtml += '<div class="summonerInfo"></div>';

	return summonerInfoHtml;
};
