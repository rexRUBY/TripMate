fetch('/mypage')
    .then((res) => {
        console.log('성공');
    })
    .catch((err) => {
        console.error('실패:', err);
    });