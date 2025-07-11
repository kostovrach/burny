(function () {
	let scrollPosition = 0;
	const ANIM_CLASS = 'anim';

	function handleScrollReturn() {
		document.body.classList.remove("lock");
		document.body.style.removeProperty("top");
		document.body.style.removeProperty("position");
		document.body.style.removeProperty("width");
		window.scrollTo(0, scrollPosition);
	}

	function handleScrollBlock() {
		scrollPosition = window.pageYOffset;
		document.body.classList.add("lock");
		document.body.style.position = "fixed";
		document.body.style.width = "100vw";
		document.body.style.top = `-${scrollPosition}px`;
	}

	// Функция для управления прокруткой внутри модалки
	function handleModalScroll(modal) {
		const scrollableElements = modal.querySelectorAll('[style*="overflow-y: auto"], [style*="overflow-y:auto"]');
		
		// Добавляем сам modal если у него есть overflow
		const allScrollableElements = [modal, ...scrollableElements].filter(el => {
			const styles = getComputedStyle(el);
			return styles.overflowY === 'auto' || styles.overflowY === 'scroll';
		});

		function handleWheel(e) {
			// Находим ближайший прокручиваемый элемент
			const scrollableParent = e.target.closest('[style*="overflow-y"], dialog');
			
			if (scrollableParent && allScrollableElements.includes(scrollableParent)) {
				const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
				const isAtTop = scrollTop === 0;
				const isAtBottom = scrollTop + clientHeight >= scrollHeight;
				
				// Если прокрутка возможна в нужном направлении, разрешаем её
				if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
					e.stopPropagation();
					return;
				}
			}
			
			// Блокируем прокрутку для всех остальных случаев
			e.preventDefault();
			e.stopPropagation();
		}

		// Обработчик для touch событий
		let touchStartY = 0;
		function handleTouchStart(e) {
			touchStartY = e.touches[0].clientY;
		}

		function handleTouchMove(e) {
			const scrollableParent = e.target.closest('[style*="overflow-y"], dialog');
			
			if (scrollableParent && allScrollableElements.includes(scrollableParent)) {
				const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
				const isAtTop = scrollTop === 0;
				const isAtBottom = scrollTop + clientHeight >= scrollHeight;
				const touchY = e.touches[0].clientY;
				const deltaY = touchStartY - touchY;
				
				// Если прокрутка возможна в нужном направлении, разрешаем её
				if ((deltaY < 0 && !isAtTop) || (deltaY > 0 && !isAtBottom)) {
					e.stopPropagation();
					return;
				}
			}
			
			e.preventDefault();
			e.stopPropagation();
		}

		// Добавляем обработчики событий
		modal.addEventListener('wheel', handleWheel, { passive: false });
		modal.addEventListener('touchstart', handleTouchStart, { passive: true });
		modal.addEventListener('touchmove', handleTouchMove, { passive: false });

		// Возвращаем функцию для удаления обработчиков
		return function removeScrollHandlers() {
			modal.removeEventListener('wheel', handleWheel);
			modal.removeEventListener('touchstart', handleTouchStart);
			modal.removeEventListener('touchmove', handleTouchMove);
		};
	}

	function closeModalWithAnimation(modal, removeScrollHandlers) {
		modal.classList.remove(ANIM_CLASS);
		setTimeout(() => {
			modal.close();
			handleScrollReturn();
			// Удаляем обработчики прокрутки
			if (removeScrollHandlers) {
				removeScrollHandlers();
			}
		}, 800);
	}

	function initModal(modalId, dataAttr, closeBtnAttr) {
		const modal = document.querySelector(modalId);
		const openBtns = document.querySelectorAll(`[data-modal=${dataAttr}]`);
		const closeBtn = modal?.querySelector(`[${closeBtnAttr}]`);

		if (!modal) return;

		let removeScrollHandlers = null;

		openBtns.forEach((el) => {
			el.addEventListener("click", function () {
				handleScrollBlock();
				modal.showModal();
				requestAnimationFrame(() => {
					modal.classList.add(ANIM_CLASS);
					document.activeElement?.blur();
					// Инициализируем обработчики прокрутки
					removeScrollHandlers = handleModalScroll(modal);
				});
			});
		});

		if (closeBtn) {
			closeBtn.addEventListener("click", () => closeModalWithAnimation(modal, removeScrollHandlers));
		}

		modal.addEventListener("cancel", (e) => {
			e.preventDefault();
			closeModalWithAnimation(modal, removeScrollHandlers);
		});

		modal.addEventListener("click", (e) => {
			if (e.target === modal) closeModalWithAnimation(modal, removeScrollHandlers);
		});
	}

	// initModal("#menu", "data-menu-open", ".menu__button-close");
	initModal("#modal-office-21", "office-21", "data-modal-close");
	initModal("#modal-room-booking", "room-booking", "data-modal-close");
})();