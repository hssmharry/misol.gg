/**
 * body 클릭
 */
$('body').on('click', function(e){
	if(!$(e.target).hasClass('inText')){
		$('.inText').removeClass('on');
	}
});


/**
 * inText 클릭
 */
$('body').on('click', '.inText', function(e){
	if(!$(e.target).hasClass('on')){
		$(e.target).addClass('on');
	}
});


/**
 * defaultBtn 마우스오버
 */
$('.defaultBtn').hover(
	function(){
		$(this).css({'background':'#22546f', 'cursor':'pointer'});
	}, function(){
		$(this).css({'background':'#4790b8', 'cursor':'normal'});
});

/**
 * tabMenu 클릭
 */
$('.tabDiv .tabMenu').click(function(){
	var searchName = $.trim($(this).text()).replace(/ /gi, '');
	$('.tabDiv .tabMenu').removeClass('on');
	$(this).addClass('on');
	searchSummoner(searchName);
});
