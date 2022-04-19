(() => {

	// 定数
	const resultsLimit   = 20;
	const pagesLimitHalf = 4;
	const pagesLimit     = pagesLimitHalf * 2 + 1;

	// 
	const MEDAL_NONE = 'meda_none.png';
	const RANK_NONE = 'rank_none.png';
	const SCORE_NONE = '-';

	// 
	const TYPES = ['easy', 'normal', 'hyper', 'ex'];

	const MEDALS = [
		'meda_a.png',
		'meda_b.png', 'meda_c.png', 'meda_d.png',
		'meda_e.png', 'meda_f.png', 'meda_g.png',
		'meda_k.png', // メモ: イージークリアの順番注意
		'meda_h.png', 'meda_i.png', 'meda_j.png',
		// MEDAL_NONE,
	];

	const RANKS = [
		'rank_s.png',
		'rank_a3.png', 'rank_a2.png', 'rank_a1.png',
		'rank_b.png', 'rank_c.png', 'rank_d.png', 'rank_e.png',
		// RANK_NONE,
	];

	// 
	const getPlayDataFromFile = (() => {

		const readAsText = file => new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = () => reject(reader.error);
			reader.readAsText(file);
		});

		const isInvalidResult = result => {

			// メモ: '0' は falsy でない
			//       空文字列 '' は falsy
			if ( ! result.music.id ) return true; // id は一意であればいいため、文字列に限る必要はない
			if ( typeof result.music.genre !== 'string' || ! result.music.genre ) return true;
			if ( typeof result.music.title !== 'string' || ! result.music.title ) return true;

			if ( ! TYPES.includes(result.type) ) return true;
			if ( result.medal !== MEDAL_NONE && ! MEDALS.includes(result.medal) ) return true;
			if ( result.rank !== RANK_NONE && ! RANKS.includes(result.rank) ) return true; // メモ: プレー済みでも resultByType.rank === RANK_NONE の可能性あり
			if ( result.score !== null && typeof result.score !== 'number' ) return true; // メモ: 今後、仕様変更する可能性を考えてコードを残す

			return false;

		};

		const getResults = rawPlayData => {

			const musicResults = rawPlayData; // メモ: 今後、仕様変更する可能性あり

			// スコアデータを楽曲単位から楽曲情報と譜面単位リザルト情報に分割
			const results = [];

			for (const musicResult of musicResults) {

				// 楽曲情報
				const music = {
					id: musicResult.id,
					genre: musicResult.genre.trim(),
					title: musicResult.title.trim(),
				};

				// リザルト情報
				const resultsByType = musicResult.results || musicResult.score; // メモ: ツール旧バージョン互換性対策

				for (const type of TYPES) {

					const resultByType = resultsByType[type];

					const result = {
						music,
						type,
						medal: resultByType.medal,
						rank: resultByType.rank, // メモ: プレー済みでも resultByType.rank === RANK_NONE の可能性あり
						score: resultByType.score === SCORE_NONE ? null : Number(resultByType.score),
					};

					if ( isInvalidResult(result) ) {
						console.error(result);
						throw new Error('スコアデータが正しくありません');
					}

					results.push(result);

				}

			}

			return results;

		};

		const getPlayDataFromFile = async file => {

			const text = await readAsText(file);
			const rawPlayData = JSON.parse(text);

			const results = getResults(rawPlayData);

			return {
				results,
			};

		};

		return getPlayDataFromFile;

	})();

	// 
	const getMedalImageURL = name => './images/medal/svg/' + name.replace('.png', '.svg') + '?v0.1.0';

	const filterResults = (() => {

		const resultsElement = document.getElementById('results');
		const paginationElements = ['pagination-header', 'pagination-footer'].map(id => document.getElementById(id));

		// 
		const escapeHTML = html => html
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;').replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;').replaceAll('\'', '&#39;');

		const getSelectedResultsHTML = selectedResults => {

			if ( selectedResults.length === 0 ) {
				return '<div class="results-empty">条件に一致するデータはありません。</div>';
			}

			return '<table id="results-table" class="results-table">' +
				'<thead><tr>' +
				'<th>ジャンル名</th><th>曲名</th><th>タイプ</th><th>メダル</th><th>ランク</th><th>スコア</th>' +
				'</tr></thead>' +
				'<tbody>' +
				selectedResults.map(r => '<tr>' + (r.music.genre !== r.music.title ? '<td>' + escapeHTML(r.music.genre) + '</td><td>' + escapeHTML(r.music.title) + '</td>' : '<td colspan="2">' + escapeHTML(r.music.genre) + '</td>') + '<td>' + r.type.toUpperCase() + '</td><td><img src="' + getMedalImageURL(r.medal) + '"></td><td><img src="' + getMedalImageURL(r.rank) + '"></td><td>' + r.score + '</td></tr>').join('') +
				'</tbody>' +
				'</table>';

		};

		// 
		const getPageNumberHTML = (pageNo, isCurrentPage = false) => (isCurrentPage ? '<span class="page-number page-number--current">' + pageNo + '</span>' : '<span class="page-number" data-page-no="' + pageNo + '">' + pageNo + '</span>');

		const getPaginationHTML = (pageNo, pageLast) => {

			let paginationHTML = '';

			if ( pageLast <= pagesLimit ) {

				for (let p = 1; p <= pageLast; p++) {
					paginationHTML += getPageNumberHTML(p, pageNo === p);
				}

			} else {

				const pageCenter = Math.min(pageLast - pagesLimitHalf, Math.max(pagesLimitHalf + 1, pageNo));

				if ( pagesLimitHalf + 2 <= pageCenter ) {

					paginationHTML += getPageNumberHTML(1);

					if ( pagesLimitHalf + 3 <= pageCenter )
						paginationHTML += '<span class="page-ellipsis">...</span>';

				}

				for (let p = pageCenter - pagesLimitHalf; p <=  pageCenter + pagesLimitHalf; p++) {
					paginationHTML += getPageNumberHTML(p, pageNo === p);
				}

				if ( pageCenter <= pageLast - pagesLimitHalf - 1 ) {

					if ( pageCenter <= pageLast - pagesLimitHalf - 2 )
						paginationHTML += '<span class="page-ellipsis">...</span>';

					paginationHTML += getPageNumberHTML(pageLast);

				}

			}

			return paginationHTML;

		};

		// 
		const updateFilteredResultsOnEvent = (event, filteredResults) => {
			const pageNumberElement = event.currentTarget;
			const pageNo = pageNumberElement.dataset.pageNo;
			const pageIndex = pageNo - 1;
			updateFilteredResults(filteredResults, pageIndex);
		};

		const updateFilteredResults = (filteredResults, pageIndex = 0) => {

			// リザルト表
			const offset = pageIndex * resultsLimit;

			const selectedResults = filteredResults.slice(offset, offset + resultsLimit);

			resultsElement.innerHTML = getSelectedResultsHTML(selectedResults);

			// ページネーション
			const pageNo   = pageIndex + 1;
			const pageLast = Math.ceil(filteredResults.length / resultsLimit);

			const paginationHTML = pageLast !== 0 ? getPaginationHTML(pageNo, pageLast) : '';

			for (const paginationElement of paginationElements) {

				paginationElement.innerHTML = paginationHTML;

				// 
				if ( 2 <= pageLast ) {

					const pageNumberElements = paginationElement.querySelectorAll('[data-page-no]');

					for (const pageNumberElement of pageNumberElements) {
						pageNumberElement.addEventListener('click', event => updateFilteredResultsOnEvent(event, filteredResults));
					}

				}

			}

		};

		// 
		const filterResults = (results, callback) => {
			const filteredResults = results.filter(callback);
			updateFilteredResults(filteredResults);
		};

		return filterResults;

	})();

	const renderTotalTables = (() => {

		const totalTablesElement = document.getElementById('total-tables');

		// 
		const createTotalTableElement = (table, columnHeaders, rowHeaders, rowHeaderOfColumnTotal) => {

			const rowTotal = table.map(row => row.reduce((sum, cell) => sum + cell));
			const columnTotal = table.reduce((sumRow, row) => sumRow.map((sumCell, i) => sumCell + row[i]));
			const grandTotal = rowTotal.reduce((sum, cell) => sum + cell);

			// 
			const tableElement = document.createElement('table');

			tableElement.innerHTML = '<colgroup>' +
				'<col>'.repeat(columnHeaders.length) +
				'</colgroup>';

			// 
			tableElement.createTHead().innerHTML = '<tr>' +
				columnHeaders.map(cell => '<th>' + cell + '</th>').join('') +
				'</tr>';

			tableElement.createTBody().innerHTML = table.map((row, i) => (
				'<tr>' +
				'<th>' + rowHeaders[i] + '</th>' +
				row.map(cell => '<td>' + cell + '</td>').join('') +
				'<td>' + rowTotal[i] + '</td>' +
				'</tr>'
			)).join('');

			tableElement.createTFoot().innerHTML = '<tr>' +
				'<th>' + rowHeaderOfColumnTotal + '</th>' +
				columnTotal.map(cell => '<td>' + cell + '</td>').join('') +
				'<td>' + grandTotal + '</td>' +
				'</tr>';

			return tableElement;

		};

		// 
		const columnHeaders = (() => {
			const row = TYPES.map(type => type.toUpperCase());
			row.unshift('');
			row.push('合計');
			return row;
		})();

		const rowHeadersOfMedals = MEDALS.map(medal => '<img src="' + getMedalImageURL(medal) + '">');

		const rowHeadersOfRanks = RANKS.map(rank => '<img src="' + getMedalImageURL(rank) + '">');

		// 
		const countOfMedals = (results, medal, type) => results.filter(r => r.type === type && r.medal === medal).length;

		const createMedalsTableElement = results => {

			const table = MEDALS.map(medal => TYPES.map(type => countOfMedals(results, medal, type)));

			// 
			const tableElement = createTotalTableElement(table, columnHeaders, rowHeadersOfMedals, 'PLAYED');

			tableElement.id = 'medals-table';
			tableElement.classList.add('total-table', 'medals-table');

			return tableElement;

		};

		// 
		const countOfRanks = (results, rank, type) => results.filter(r => r.type === type && r.rank === rank).length;

		const createRanksTableElement = results => {

			const table = RANKS.map(rank => TYPES.map(type => countOfRanks(results, rank, type)));

			// 
			const tableElement = createTotalTableElement(table, columnHeaders, rowHeadersOfRanks, 'RANKED');

			tableElement.id = 'ranks-table';
			tableElement.classList.add('total-table', 'ranks-table');

			return tableElement;

		};

		// 
		/**
		 * 自身または祖先からテーブルのセルの要素を取得
		 * 
		 * セル以外の要素の場合は undefined を返す
		 */
		const getClosestCellElement = (element, tableElement) => {

			while ( ! /^td|th$/i.test(element.tagName) ) {
				if ( element === tableElement ) return;
				element = element.parentNode;
				if ( ! element ) return;
			}

			return element;

		};

		// 
		const unselectAll = () => {

			const selectedElements = totalTablesElement.querySelectorAll('[data-selected]');

			for (const selectedElement of selectedElements) {

				const selectedType = selectedElement.dataset.selected;

				selectedElement.classList.remove('total-table--selected-' + selectedType);
				delete selectedElement.dataset.selected;

			}

		};

		const selectTotalTableCell = (tableElement, row, column, isOuterRow, isOuterColumn) => {

			const cellElement = tableElement.rows[row].cells[column];

			cellElement.classList.add('total-table--selected-cell');
			cellElement.dataset.selected = 'cell';

			if ( isOuterRow && isOuterColumn ) {
				tableElement.classList.add('total-table--selected-all');
				tableElement.dataset.selected = 'all';
			} else if ( isOuterRow ) {
				const columnElement = tableElement.getElementsByTagName('col')[column];
				columnElement.classList.add('total-table--selected-column');
				columnElement.dataset.selected = 'column';
			} else if ( isOuterColumn ) {
				const rowElement = tableElement.rows[row];
				rowElement.classList.add('total-table--selected-row');
				rowElement.dataset.selected = 'row';
			}

		};

		const filterResultsByMedalsTable = (results, tableElement, row, column) => {

			const medal = (0 === row || row === MEDALS.length + 1) ? null : MEDALS[row - 1];
			const type = (0 === column || column === TYPES.length + 1) ? null : TYPES[column - 1];

			selectTotalTableCell(tableElement, row, column, medal === null, type === null);

			// 
			filterResults(results, r => (
				((medal === null && MEDALS.includes(r.medal)) || r.medal === medal) &&
				(type === null || r.type === type)
			));

		};

		const filterResultsByRanksTable = (results, tableElement, row, column) => {

			const rank = (0 === row || row === RANKS.length + 1) ? null : RANKS[row - 1];
			const type = (0 === column || column === TYPES.length + 1) ? null : TYPES[column - 1];

			selectTotalTableCell(tableElement, row, column, rank === null, type === null);

			// 
			filterResults(results, r => (
				((rank === null && RANKS.includes(r.rank)) || r.rank === rank) &&
				(type === null || r.type === type)
			));

		};

		const filterResultsOnEvent = (event, results) => {

			const tableElement = event.currentTarget;

			const cellElement = getClosestCellElement(event.target, tableElement);

			if ( ! cellElement ) return;

			const row    = cellElement.parentNode.rowIndex;
			const column = cellElement.cellIndex;

			// 
			unselectAll();

			// 
			const id = tableElement.id;

			if ( 'medals-table' === id ) {
				filterResultsByMedalsTable(results, tableElement, row, column);
			} else if ( 'ranks-table' === id ) {
				filterResultsByRanksTable(results, tableElement, row, column);
			}

		};

		// 
		const renderTotalTables = results => {

			// 
			totalTablesElement.innerHTML = '';

			const medalsTableElement = totalTablesElement.appendChild(createMedalsTableElement(results));
			const ranksTableElement = totalTablesElement.appendChild(createRanksTableElement(results));

			medalsTableElement.addEventListener('click', event => filterResultsOnEvent(event, results));
			ranksTableElement.addEventListener('click', event => filterResultsOnEvent(event, results));

			// 
			filterResultsByMedalsTable(results, medalsTableElement, 0, 0);

		};

		return renderTotalTables;

	})();

	// 
	const convert = (() => {

		const resultError = document.getElementById('result-error');
		const resultOk = document.getElementById('result-ok');

		// 
		const showElement = element => {
			element.classList.add('displayed');
		};

		const hideElement = element => {
			element.classList.remove('displayed');
		};

		// 
		const initElements = () => {
			hideElement(resultError);
			hideElement(resultOk);
		};

		const renderError = error => {
			console.error(error);
		};

		const convert = async file => {

			initElements();

			try {

				const playData = await getPlayDataFromFile(file);

				renderTotalTables(playData.results);

				showElement(resultOk);

			} catch (error) {
				renderError(error);
				showElement(resultError);
			}

		};

		return convert;

	})();

	(() => {

		const inputFileElement = document.getElementById('file');

		const convertOnEvent = async file => {

			inputFileElement.disabled = true;

			await convert(file);

			inputFileElement.disabled = false;

		};

		// 
		inputFileElement.addEventListener('click', () => {
			inputFileElement.value = '';
		});

		inputFileElement.addEventListener('change', event => {
			const files = event.target.files;
			if ( files.length !== 1 ) return;
			convertOnEvent(files[0]); // メモ: await していないため注意
		});

		inputFileElement.disabled = false;

	})();

})();
