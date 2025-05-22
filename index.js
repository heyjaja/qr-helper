document.addEventListener('DOMContentLoaded', function() {
    // 현재 날짜 설정
    updateCurrentDate();

    // 이벤트 리스너 등록
    document.getElementById('newsTitle').addEventListener('input', updateGeneratedTitle);
    document.getElementById('category').addEventListener('change', updateGeneratedTitle);
    document.getElementById('generateBtn').addEventListener('click', generateFinalResult);
    document.getElementById('processYoutubeBtn').addEventListener('click', processYoutubeInput);
    document.getElementById('copyFinalBtn').addEventListener('click', () => copyToClipboard('finalResult'));
    document.getElementById('copyYoutubeBtn').addEventListener('click', () => copyToClipboard('youtubeCode'));
    document.getElementById('clearAllBtn').addEventListener('click', clearAllFields);
    document.getElementById('saveBtn').addEventListener('click', saveTxt);

    document.getElementById('clearYoutubeBtn').addEventListener('click', clearYoutubeFields);

    // 추가 이벤트 리스너
    document.getElementById('updateTitleBtn').addEventListener('click', updateGeneratedTitle);

    const DEFAULT_HEIGHT = 30; // textarea 기본 height

    const $textarea = document.querySelector('#newsContent');

    $textarea.oninput = (event) => {
        const $target = event.target;

        $target.style.height = '';
        $target.style.height = DEFAULT_HEIGHT + $target.scrollHeight + 'px';
    };
});

function updateCurrentDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${month}${day}`;

    document.getElementById('currentDate').textContent = `오늘 날짜: ${now.getFullYear()}년 ${month}월 ${day}일 (${formattedDate})`;
}

function updateGeneratedTitle() {
    const title = document.getElementById('newsTitle').value;
    const category = document.getElementById('category').value;
    let generatedTitle = '';

    if (title && category) {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${month}${day}`;

        // 카테고리별 접두사 설정
        let prefix = '';
        prefix = `[말하는 기자들_${category}_${dateStr}]`;

        generatedTitle = `${title} ${prefix}`;
    }

    document.getElementById('generatedTitle').textContent = generatedTitle;
}

function generateFinalResult() {
    const pageNumber = document.getElementById('pageNumber').value;
    const generatedTitle = document.getElementById('generatedTitle').textContent;
    const content = document.getElementById('newsContent').value;

    // 해시태그 생성
    const hashtagsInput = document.getElementById('hashtags').value;
    const hashtags = hashtagsInput
        .split(/\s+/)
        .filter(tag => tag.trim() !== '')
        .map(tag => `#${tag}`)
        .join(' ');

    // 키워드 생성
    const keywordsInput = document.getElementById('keywords').value;
    const keywords = keywordsInput
        .split(/\s+/)
        .filter(keyword => keyword.trim() !== '')
        .join(',');

    // 결과 조합 (라벨 없이 내용만, 줄바꿈 포함)
    const result = `${pageNumber}\n\n${generatedTitle}\n\n${content}\n\n${hashtags}\n\n\n${keywords}`;

    // textContent는 줄바꿈이 제대로 표시되지 않으므로 innerHTML 사용
    const finalResultElement = document.getElementById('finalResult');
    finalResultElement.innerHTML = result.replace(/\n/g, '<br>');

    // 복사를 위한 원본 텍스트도 저장
    finalResultElement.setAttribute('data-text', result);
}

function processYoutubeInput() {
    const sourceCode = document.getElementById('youtubeSourceInput').value;
    if (!sourceCode) {
        showToast('유튜브 소스코드를 입력해주세요.', 'error');
        return;
    }

    const width = document.getElementById("youtubeWidth").value || 644;
    const height = document.getElementById("youtubeHeight").value || 362;
    const autoplay = document.getElementById("autoplay").checked;

    // width와 height 변경
    let processedCode = sourceCode
        .replace(/width="[^"]*"/g, `width="${width}"`)
        .replace(/height="[^"]*"/g, `height="${height}"`);

    if(autoplay) {
        // src 속성에 autoplay=1&mute=1 파라미터 추가
        processedCode = processedCode.replace(
            /src="([^"?]*)((?:\?[^"]*)?)"/,
            'src="$1?autoplay=1&mute=1"'
        );
    }

    document.getElementById('youtubeCode').textContent = processedCode;

    // 미리보기에는 autoplay=1 파라미터를 제거하여 자동재생 방지
    const previewCode = processedCode.replace('?autoplay=1&mute=1', '');
    document.getElementById('youtubePreview').innerHTML = `<div>미리보기:</div>` + previewCode;
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    // 데이터 속성에 저장된 원본 텍스트가 있으면 사용, 없으면 innerText 사용
    const text = element.getAttribute('data-text') || element.innerText;

    navigator.clipboard.writeText(text)
        .then(() => {
            showToast('클립보드에 복사되었습니다', 'success');
        })
        .catch(err => {
            console.error('복사 실패:', err);
            showToast('복사 실패', 'error');

        });
}
function clearAllFields() {
    // 모든 입력 필드 초기화
    document.getElementById('pageNumber').value = '';
    document.getElementById('newsTitle').value = '';
    document.getElementById('category').value = '';
    document.getElementById('newsContent').value = '';
    document.getElementById('hashtags').value = '';
    document.getElementById('keywords').value = '';
    document.getElementById('youtubeSourceInput').value = '';

    // 결과 영역 초기화
    document.getElementById('generatedTitle').textContent = '';
    document.getElementById('finalResult').innerHTML = '';
    document.getElementById('youtubeCode').textContent = '';
    document.getElementById('youtubePreview').innerHTML = '';

    // 첫 번째 입력 필드에 포커스
    document.getElementById('pageNumber').focus();
}

function saveTxt() {
    const finalResultElement = document.getElementById('finalResult');
    const defaultTemplate = `?autoplay=1&mute=1

리포트
<iframe width="644" height="362"

쇼츠
<iframe width="362" height="644"

QR링크
https://youtu.be/주소

*재생목록 공동체부 -> 사회
정치, 사회 제외 모두 산업, 경제&금융2
=================================================

`

    const finalResult =  defaultTemplate + finalResultElement.innerHTML;
    const content = finalResult.replace(/<br>/g, '\n')

    const filenameInputElem = document.getElementById('filenameInput');

    // 파일 이름 가져오기
    let filename = filenameInputElem.value.trim();
    if (!filename) {
        filename = 'report.txt';
    } else if (!filename.toLowerCase().endsWith('.txt')) {
        filename += '.txt';
    }

    // Blob 생성
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    // 다운로드 링크 생성
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;

    // 다운로드 트리거
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // 클린업
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);

}

const toastContainer = document.getElementById('toastContainer');

// 토스트 메시지 표시 함수
function showToast(message, type = 'info', duration = 3000) {
    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    // 아이콘 선택
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';

    // 토스트 내용 구성
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    // 토스트 컨테이너에 추가
    toastContainer.appendChild(toast);

    // 애니메이션을 위해 약간 지연 후 show 클래스 추가
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 지정된 시간 후 토스트 제거
    setTimeout(() => {
        toast.classList.remove('show');

        // 애니메이션 완료 후 요소 제거
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, duration);
}


function clearYoutubeFields() {
    document.getElementById('youtubeSourceInput').value = '';
    document.getElementById('youtubeCode').textContent = '';
    document.getElementById('youtubePreview').innerHTML = '';
}