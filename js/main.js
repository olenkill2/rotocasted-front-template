"use strict"

/**
 * инициализация всех инициализаций
 */
$(document).ready(function()
{
	o2.init();
});
$(window).on('load', () => {
	// console.log(o2.deliveryAnimate);
})
/**
 * основной объект
 * @type {object}
 */
var o2 =
{
	/**
	 * вызов функций, которые должны запускаться при загрузке страницы
	 */
	init()
	{

	},
	/**
	* подгрузка картинок при скролле
	*/
	lazyLoad:
	{
		lazy: null,
		init()
		{
			this.lazy = new LazyLoad({
				elements_selector: ".lazy-image",
				threshold: 100,
			});
		}
	},

	/**
	* объект с анимациями
	*/
	animations:
	{
		showHeaderItems()
		{
			var items = $('.header .header-anim:visible').toArray();

			anime({
				targets: items,
				opacity: [0, 1],
				duration: 600 / items.length,
				delay: anime.stagger(140),
				easing: 'easeInOutQuad',
				complete: () => {
					$('.header .header-anim').css({'opacity': 1});
				}
			});
		},
		riformaAdvantages()
		{
			anime({
				targets: '.r-a__1-2',
				strokeDashoffset: [anime.setDashoffset, 0],
				easing: 'easeInOutSine',
				duration: 1500,
				loop: true,
				autoplay: true
			});
			anime({
				targets: '.r-a__1-1',
				easing: 'easeInOutSine',
				duration: 400,
				translateX: ['-50%', 0],
				opacity: [0, 1],
				direction: 'alternate',
				loop: true,
				autoplay: true
			});
		}
	},

	tabs:
	{
		open(instance, tabId)
		{
			const tabsContainer = $(instance).parents('._tabs-container');
			const openedTab = $(tabsContainer).find('.tab[data-tab-id="' + tabId + '"]');
			if($(openedTab).hasClass('tab_open'))
				return false;

			$(tabsContainer).find('.tab.tab_open').fadeOut(200, () => {
				$('.tab').removeClass('tab_open')
				$(openedTab).fadeIn(200).addClass('tab_open');
			});
		},
	},

	/**
	* отслеживание клика вне блока
	*/
	clickOutside(element, callback)
	{
		var outsideChecker = (event) =>
		{
			var container = $(element);

			if (!container.is(event.target) && container.has(event.target).length === 0)
			{
				document.removeEventListener('click', outsideChecker);
				callback();
			}
		};

		document.addEventListener('click', outsideChecker);

		return outsideChecker;
	},

	shops:
	{
			open: false,
			clickOutsideListener: null,

			/**
			* открытие/закрытие списка стран
			*/
			countrySelectDropdownToggle()
			{
				if(!this.open)
				{
					this.clickOutsideListener = o2.clickOutside($('.shops-select'), () => {
						o2.shops.countrySelectDropdownToggle()
					});

					$('.shops-select').addClass('shops-select_open-list');
					this.open = true;
				}
				else
				{
					$('.shops-select').removeClass('shops-select_open-list');
					document.removeEventListener('click', this.clickOutsideListener);
					this.open = false;
				}
			},

			/**
			* устанавливаем название выбранного города
			*/
			selectCountry(instance)
			{
				$('.shops-select').find('._shops-select-name').html($(instance).html());
				this.countrySelectDropdownToggle();
			},

			toggleAccordeon(instance)
			{
				$(instance).parent().siblings().find('.shops-results-item__bot').slideUp(200);
				$(instance).parent().siblings().removeClass('shops-results-item_active');

				$(instance).next().slideToggle(200);
				$(instance).parent().toggleClass('shops-results-item_active');
			}
	},

	/**
	* объект для работы с попапами
	*/
	popups:
	{
		/**
		* текущий timeline анимации
		*/
		currentTimeLine: false,

		/**
		* текущий открытый попап в dom
		*/
		openedPopupBox: false,

		/**
		* название открытого попапа
		*/
		openedPopupName: '',

		/**
		* анимация открытия/закрытия
		*/
		animate(popupBox, popupBoxName)
		{
			this.currentTimeLine = anime.timeline({
				autoplay: false,
				duration: 250,
				easing: 'linear',
			});

			const burger = $('.header-burger:visible');

			this.currentTimeLine
			.add({
				targets: $(this.openedPopupBox).find('.popup-overlay').get(0),
				opacity: [0, 1],
			})
			.add({
				targets: $(this.openedPopupBox).find('.popup-body').get(0),
				translateX: ['100%', 0],
			})
			.add({
				targets: $(this.openedPopupBox).find('.popup-body-html').get(0),
				opacity: [0, 1],
				duration: 250,
			})
			if(burger.length)
				this.currentTimeLine.add({
					targets: $(burger).get(0),
					duration: 200,
					translateX: ($(window).width() - $(burger).offset().left) - ($(burger).width() + 22)
				}, 300);
		},

		/**
		* открытие/закрытие при помощи бургера
		*/
		toggleByBurger(popupName)
		{
			if(this.openedPopupName)
				this.close()
			else
				this.open(popupName);
		},

		/**
		* открытие попапа по дата атрибуту
		*/
		open(popupName)
		{
			let timeForOpen = 0;
			if(this.openedPopupName === popupName)
			{
				this.close();
				return false;
			}

			if(this.openedPopupName && this.openedPopupName != popupName)
				timeForOpen = this.close();

			setTimeout(() => {
				this.openedPopupName = popupName;
				this.openedPopupBox = $('.popup-wr[data-popup-name="' + this.openedPopupName + '"]');

				$(this.openedPopupBox).css({'display': 'flex'});
				bodyScrollLock.disableBodyScroll($(this.openedPopupBox).find('.popup-body')[0], {reserveScrollBarGap: true});

				this.animate(this.openedPopupBox);
				this.currentTimeLine.play();

				if($(this.openedPopupBox).find('.popup-slider').attr('class') == 'popup-slider')
				{
					o2.sliders.popupSlider(this.openedPopupBox);
				};
			}, timeForOpen);
			document.addEventListener('keyup', this.closeOnKeyUp);
		},

		/**
		* закрытие попапов
		*/
		close()
		{
			this.currentTimeLine.reverse();
			this.currentTimeLine.completed = false;
			this.currentTimeLine.play();

			setTimeout(() => {
				$('.popup-wr').hide();
				bodyScrollLock.clearAllBodyScrollLocks({reserveScrollBarGap: true});
			}, this.currentTimeLine.duration);

			this.openedPopupBox = '';
			this.openedPopupName = '';
			document.removeEventListener('keyup', this.closeOnKeyUp);
			return this.currentTimeLine.duration;

		},
		closeOnKeyUp: function(event)
		{
			if (event.keyCode === 27)
				o2.popups.close();
		}
	},

	// всплывающие окна авторизация и отправка завяки
	popover:
	{
		clickOutsideListener: null,
		openedPopover: null,
		open(popoverName)
		{
			const popover = $('.popover-wr[data-popover-name="' + popoverName + '"]');
			const pageContaienr = $('.container');
			const y = ($(window).width() - $(pageContaienr).width()) / 2;

			if(y < 40)
				$(popover).css({'right': 0});
			else
				$(popover).css({'right': (-(y - 20)) / 4});

			$(popover).fadeIn(200, () =>
			{
				this.clickOutsideListener = o2.clickOutside(popover, () => {
					o2.popover.close();
				});
				this.openedPopover = popover;
			});
		},
		close()
		{
			$(this.openedPopover).fadeOut(200);
			this.openedPopover = null;
			document.removeEventListener('click', this.clickOutsideListener);
			this.clickOutsideListener = null;
		},
	},

	/**
	* объект для работы с дропдаунами
	*/
	dropdown:
	{
		/**
		* открыть/закрыть выпадающий спсиок
		*/
		toggle(instance)
		{
			var parent = $(instance).parents('.dropdown-wr').first();
			$(parent).find('.dropdown-list').first().slideToggle(200);
			$(parent).find('.dropdown-activator').first().toggleClass('dropdown-activator_active');
			$(parent).toggleClass('dropdown-wr_active');
		},
	},
}