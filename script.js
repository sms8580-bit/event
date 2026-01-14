/* 
 * After Entertainment - 메인 스크립트
 * 기능: 헤더 스크롤 효과, 페이지 활성화 상태, 문의 폼 처리, 
 *       스크롤 애니메이션, 페이지 전환 효과, 무한 슬라이더, 히어로 이미지 슬라이더
 * 최종 수정: 2026-01-14
 */

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');

    // 1. 헤더 스크롤 효과
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. 현재 페이지 링크 활성화 (Active State)
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
    });

    // 3. 문의하기 폼 제출 처리
    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('문의가 정상적으로 접수되었습니다. 담당자가 곧 연락드리겠습니다.');
            inquiryForm.reset();
        });
    }

    // 4. 간단한 등장 애니메이션 (스크롤 시)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        // 히어로 섹션과 서브 비주얼 섹션은 배경이 즉시 보여야 하므로 애니메이션 없이 즉시 노출
        // (서브 비주얼 내부의 텍스트 애니메이션은 CSS에서 처리됨)
        if (section.classList.contains('hero') || section.classList.contains('sub-visual')) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
            return;
        }

        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        section.style.transition = 'all 1.2s cubic-bezier(0.2, 0, 0.2, 1)';
        observer.observe(section);
    });

    // 페이지 진입 시점에 혹시 남아있을 수 있는 fade-out 클래스 강제 제거
    document.body.classList.remove('fade-out');

    // 5. 페이지 페이드아웃 및 캐시 대응 (뒤로가기 시 흰 화면 방지)
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');

            // 내부 .html 페이지 이동 시에만 페이드아웃 애니메이션 적용
            if (href && href.endsWith('.html') && !href.startsWith('http') && href !== currentPath && target !== '_blank') {
                e.preventDefault();
                document.body.classList.add('fade-out');

                // 애니메이션 시간(0.8초) 후 페이지 이동
                setTimeout(() => {
                    window.location.href = href;
                }, 800);
            }
        });
    });

    // 브라우저 뒤로가기/앞으로가기 등으로 페이지가 다시 활성화될 때 (BFcache 대응)
    window.addEventListener('pageshow', (event) => {
        // 캐시된 상태에서 복원될 때 fade-out 클래스를 제거하고 페이드인 효과 보장
        document.body.classList.remove('fade-out');

        // 뒤로가기 시 페이드인 애니메이션이 다시 작동하도록 처리
        if (event.persisted) {
            document.body.style.animation = 'none';
            void document.body.offsetWidth; // 리플로우 강제 발생
            document.body.style.animation = 'fadeInPage 1.2s ease-out forwards';
        }
    });

    // 6. 무한 슬라이더 아이템 복제 (메인 페이지 전용)
    const sliderTrack = document.getElementById('sliderTrack');
    if (sliderTrack) {
        const items = sliderTrack.innerHTML;
        sliderTrack.innerHTML = items + items; // 동일한 아이템들을 뒤에 한 세트 더 추가
    }

    // 7. 히어로 슬라이더 로직
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 3000);
    }

    // 8. 포트폴리오 페이지네이션 및 모달 (포트폴리오 페이지 전용)
    const portfolioContainer = document.getElementById('portfolioItems');
    if (portfolioContainer) {
        const items = Array.from(portfolioContainer.getElementsByClassName('portfolio-item'));
        const pagination = document.getElementById('pagination');
        const itemsPerPage = 12; // 3*4 배열
        let currentPage = 1;

        function showPage(page) {
            currentPage = page;
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            items.forEach((item, index) => {
                if (index >= start && index < end) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });

            // 페이지 버튼 활성화 상태 업데이트
            const buttons = pagination.getElementsByClassName('page-btn');
            Array.from(buttons).forEach((btn, idx) => {
                if (idx + 1 === page) btn.classList.add('active');
                else btn.classList.remove('active');
            });

            // 스크롤 상단 이동 (선택 사항)
            window.scrollTo({ top: portfolioContainer.offsetTop - 100, behavior: 'smooth' });
        }

        function setupPagination() {
            const pageCount = Math.ceil(items.length / itemsPerPage);
            pagination.innerHTML = '';

            for (let i = 1; i <= pageCount; i++) {
                const btn = document.createElement('button');
                btn.innerText = i;
                btn.classList.add('page-btn');
                if (i === 1) btn.classList.add('active');
                btn.addEventListener('click', () => showPage(i));
                pagination.appendChild(btn);
            }
        }

        // 초기 실행
        setupPagination();
        showPage(1);

        // 상세 보기 모달 로직
        const modal = document.getElementById('portfolioModal');
        const modalImg = document.getElementById('modalImage');
        const captionText = document.getElementById('modalCaption');
        const closeBtn = document.getElementsByClassName('modal-close')[0];

        items.forEach(item => {
            item.addEventListener('click', function () {
                const imgSrc = this.getAttribute('data-img');
                const title = this.querySelector('h3').innerText;
                modal.style.display = "block";
                modalImg.src = imgSrc;
                captionText.innerHTML = title;
                document.body.style.overflow = 'hidden'; // 스크롤 방지
            });
        });

        closeBtn.onclick = function () {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
                document.body.style.overflow = 'auto';
            }
        }
    }
});
