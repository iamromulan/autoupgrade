'use strict';
'require view';
'require uci';
'require fs';
'require ui';

var currentMode = 'autoupdates';
var installedPackages = [];
var autoPackages = {};
var currentFilter = '';
var currentPage = 0;
var pageSize = 100;

function handleMode(ev) {
	var tab = ev.target.closest('li');
	if (!tab || tab.getAttribute('data-mode') === currentMode)
		return;

	tab.parentNode.querySelectorAll('li').forEach(function(li) {
		li.classList.remove('cbi-tab');
		li.classList.add('cbi-tab-disabled');
	});
	tab.classList.remove('cbi-tab-disabled');
	tab.classList.add('cbi-tab');

	currentMode = tab.getAttribute('data-mode');
	currentPage = 0;
	display();
}

function handleFilter(ev) {
	currentFilter = ev.target.value.toLowerCase();
	currentPage = 0;
	display();
}

function display() {
	var rows = [];

	if (currentMode === 'autoupdates') {
		var names = Object.keys(autoPackages).sort();
		names.forEach(function(name) {
			if (currentFilter && name.toLowerCase().indexOf(currentFilter) === -1)
				return;

			var removeBtn = E('button', {
				'class': 'btn cbi-button-negative',
				'data-package': name,
				'click': handleRemoveAuto
			}, _('Remove'));

			rows.push([name, autoPackages[name] || '', removeBtn]);
		});
	} else {
		installedPackages.forEach(function(pkg) {
			if (currentFilter && pkg.name.toLowerCase().indexOf(currentFilter) === -1)
				return;

			var btn;
			if (autoPackages[pkg.name]) {
				btn = E('button', {
					'class': 'btn cbi-button-neutral',
					'disabled': 'disabled'
				}, _('Added'));
			} else {
				btn = E('button', {
					'class': 'btn cbi-button-action',
					'data-package': pkg.name,
					'click': handleAddAuto
				}, _('Autoupdate'));
			}

			rows.push([pkg.name, pkg.version, btn]);
		});
	}

	var totalRows = rows.length;
	var totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
	if (currentPage >= totalPages) currentPage = totalPages - 1;
	var pageRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

	var table = document.getElementById('autoupgrade-packages');
	if (table) {
		while (table.rows.length > 1)
			table.deleteRow(1);

		if (pageRows.length === 0) {
			var tr = table.insertRow();
			var td = tr.insertCell();
			td.colSpan = 3;
			td.className = 'td center';
			td.textContent = currentMode === 'autoupdates'
				? _('No packages configured for auto-update.')
				: _('No packages found.');
		} else {
			pageRows.forEach(function(row) {
				var tr = table.insertRow();
				tr.className = 'tr';

				var tdName = tr.insertCell();
				tdName.className = 'td col-4 left';
				tdName.textContent = row[0];

				var tdVer = tr.insertCell();
				tdVer.className = 'td col-3 left';
				tdVer.textContent = row[1];

				var tdAction = tr.insertCell();
				tdAction.className = 'td right';
				tdAction.appendChild(row[2]);
			});
		}
	}

	var pager = document.getElementById('autoupgrade-pager');
	if (pager) {
		var start = totalRows > 0 ? (currentPage * pageSize) + 1 : 0;
		var end = Math.min((currentPage + 1) * pageSize, totalRows);

		pager.innerHTML = '';
		pager.appendChild(E('span', {},
			_('Displaying %d-%d of %d').format(start, end, totalRows)));
		pager.appendChild(document.createTextNode(' '));
		pager.appendChild(E('button', {
			'class': 'btn cbi-button-neutral',
			'disabled': currentPage === 0 ? 'disabled' : null,
			'click': function() { currentPage--; display(); }
		}, _('Previous')));
		pager.appendChild(document.createTextNode(' '));
		pager.appendChild(E('button', {
			'class': 'btn cbi-button-neutral',
			'disabled': currentPage >= totalPages - 1 ? 'disabled' : null,
			'click': function() { currentPage++; display(); }
		}, _('Next')));
	}

	var settingsDiv = document.getElementById('autoupgrade-settings');
	var logDiv = document.getElementById('autoupgrade-log');
	if (settingsDiv) settingsDiv.style.display = currentMode === 'autoupdates' ? '' : 'none';
	if (logDiv) logDiv.style.display = currentMode === 'autoupdates' ? '' : 'none';
}

function handleAddAuto(ev) {
	var name = ev.target.getAttribute('data-package');
	if (!name || autoPackages[name])
		return;

	var sid = uci.add('autoupgrade', 'package');
	uci.set('autoupgrade', sid, 'name', name);

	autoPackages[name] = '';
	installedPackages.forEach(function(pkg) {
		if (pkg.name === name) autoPackages[name] = pkg.version;
	});

	display();
	uci.save().then(function() { uci.apply(); });
}

function handleRemoveAuto(ev) {
	var name = ev.target.getAttribute('data-package');
	if (!name)
		return;

	var sections = uci.sections('autoupgrade', 'package');
	for (var i = 0; i < sections.length; i++) {
		if (sections[i].name === name) {
			uci.remove('autoupgrade', sections[i]['.name']);
			break;
		}
	}

	delete autoPackages[name];
	display();
	uci.save().then(function() { uci.apply(); });
}

function handleSettingSave() {
	var enabled = document.getElementById('autoupgrade-enabled');
	var interval = document.getElementById('autoupgrade-interval');
	var time = document.getElementById('autoupgrade-time');
	var retry = document.getElementById('autoupgrade-retry');

	if (time && !/^([01]?\d|2[0-3]):[0-5]\d$/.test(time.value)) {
		ui.addNotification(null, E('p', _('Time must be in HH:MM format (24-hour).')), 'warning');
		return;
	}

	uci.set('autoupgrade', 'settings', 'enabled', enabled.checked ? '1' : '0');
	uci.set('autoupgrade', 'settings', 'interval', interval.value);
	uci.set('autoupgrade', 'settings', 'time', time.value);
	uci.set('autoupgrade', 'settings', 'retry_interval', retry.value);

	uci.save().then(function() {
		return uci.apply();
	}).then(function() {
		ui.addNotification(null, E('p', _('Settings saved.')), 'info');
	});
}

function handleRunNow() {
	ui.showModal(_('Run Upgrade Check'), [
		E('p', _('Run an upgrade check now for all configured packages?')),
		E('div', { 'class': 'right' }, [
			E('button', { 'class': 'btn', 'click': ui.hideModal }, _('Cancel')),
			E('button', {
				'class': 'btn cbi-button-positive',
				'click': function() {
					ui.hideModal();
					ui.showModal(_('Running...'), [
						E('p', { 'class': 'spinning' }, _('Running upgrade check, please wait...'))
					]);
					fs.exec('/usr/bin/autoupgrade').then(function(res) {
						ui.hideModal();
						return fs.read('/var/log/autoupgrade.log').catch(function() { return ''; });
					}).then(function(log) {
						var logBox = document.getElementById('autoupgrade-logbox');
						if (logBox) logBox.value = log || _('No log entries.');
						ui.addNotification(null, E('p', _('Upgrade check complete. See log below.')), 'info');
					}).catch(function(err) {
						ui.hideModal();
						ui.addNotification(null, E('p', _('Error: ') + err.message), 'danger');
					});
				}
			}, _('Run Now'))
		])
	]);
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('autoupgrade'),
			fs.exec_direct('/usr/libexec/autoupgrade-list', []).catch(function() { return ''; }),
			fs.read('/var/log/autoupgrade.log').catch(function() { return ''; })
		]);
	},

	render: function(data) {
		var installedRaw = data[1] || '';
		var logData = data[2] || '';

		installedPackages = [];
		installedRaw.trim().split('\n').forEach(function(line) {
			if (!line) return;
			var parts = line.split('\t');
			if (parts[0]) {
				installedPackages.push({ name: parts[0], version: parts[1] || '' });
			}
		});
		installedPackages.sort(function(a, b) { return a.name.localeCompare(b.name); });

		autoPackages = {};
		var sections = uci.sections('autoupgrade', 'package');
		sections.forEach(function(s) {
			if (s.name) {
				var ver = '';
				installedPackages.forEach(function(pkg) {
					if (pkg.name === s.name) ver = pkg.version;
				});
				autoPackages[s.name] = ver;
			}
		});

		var enabled = uci.get('autoupgrade', 'settings', 'enabled') === '1';
		var interval = uci.get('autoupgrade', 'settings', 'interval') || 'daily';
		var time = uci.get('autoupgrade', 'settings', 'time') || '03:00';
		var retryInterval = uci.get('autoupgrade', 'settings', 'retry_interval') || '30';

		var view = E('div', {}, [
			E('h2', {}, _('Auto Upgrade')),

			E('ul', { 'class': 'cbi-tabmenu' }, [
				E('li', {
					'data-mode': 'autoupdates',
					'class': 'cbi-tab',
					'click': handleMode
				}, E('a', { 'href': '#' }, _('Auto Updates'))),
				E('li', {
					'data-mode': 'installed',
					'class': 'cbi-tab-disabled',
					'click': handleMode
				}, E('a', { 'href': '#' }, _('Installed')))
			]),

			E('div', { 'id': 'autoupgrade-settings', 'class': 'cbi-section' }, [
				E('h3', {}, _('Schedule')),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title' }, _('Enabled')),
					E('div', { 'class': 'cbi-value-field' },
						E('input', {
							'id': 'autoupgrade-enabled',
							'type': 'checkbox',
							'checked': enabled ? 'checked' : null
						})
					)
				]),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title' }, _('Interval')),
					E('div', { 'class': 'cbi-value-field' },
						E('select', { 'id': 'autoupgrade-interval', 'class': 'cbi-input-select' }, [
							E('option', { 'value': 'daily', 'selected': interval === 'daily' ? 'selected' : null }, _('Daily')),
							E('option', { 'value': 'weekly', 'selected': interval === 'weekly' ? 'selected' : null }, _('Weekly (Sunday)')),
							E('option', { 'value': 'monthly', 'selected': interval === 'monthly' ? 'selected' : null }, _('Monthly (1st)'))
						])
					)
				]),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title' }, _('Time')),
					E('div', { 'class': 'cbi-value-field' },
						E('input', {
							'id': 'autoupgrade-time',
							'type': 'text',
							'class': 'cbi-input-text',
							'value': time,
							'placeholder': '03:00'
						})
					)
				]),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title' }, _('Retry interval (minutes)')),
					E('div', { 'class': 'cbi-value-field' },
						E('input', {
							'id': 'autoupgrade-retry',
							'type': 'text',
							'class': 'cbi-input-text',
							'value': retryInterval,
							'placeholder': '30'
						})
					)
				]),
				E('div', { 'class': 'cbi-value' }, [
					E('label', { 'class': 'cbi-value-title' }, ' '),
					E('div', { 'class': 'cbi-value-field' }, [
						E('button', {
							'class': 'btn cbi-button-positive',
							'click': handleSettingSave
						}, _('Save Settings')),
						' ',
						E('button', {
							'class': 'btn cbi-button-action',
							'click': handleRunNow
						}, _('Run Now'))
					])
				])
			]),

			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'style': 'margin-bottom: 8px' },
					E('input', {
						'type': 'text',
						'placeholder': _('Type to filter…'),
						'style': 'width: 100%; padding: 6px;',
						'input': handleFilter
					})
				),
				E('table', { 'id': 'autoupgrade-packages', 'class': 'table' }, [
					E('tr', { 'class': 'tr cbi-section-table-titles' }, [
						E('th', { 'class': 'th col-4 left' }, _('Package name')),
						E('th', { 'class': 'th col-3 left' }, _('Version')),
						E('th', { 'class': 'th right' }, ' ')
					])
				]),
				E('div', { 'id': 'autoupgrade-pager', 'style': 'margin-top: 8px; text-align: right' })
			]),

			E('div', { 'id': 'autoupgrade-log', 'class': 'cbi-section' }, [
				E('h3', {}, _('Upgrade Log')),
				E('div', { 'style': 'margin-bottom: 8px' }, [
					E('button', {
						'class': 'btn cbi-button-neutral',
						'click': function() {
							fs.read('/var/log/autoupgrade.log').then(function(content) {
								var logBox = document.getElementById('autoupgrade-logbox');
								if (logBox) logBox.value = content || _('No log entries.');
							}).catch(function() {
								var logBox = document.getElementById('autoupgrade-logbox');
								if (logBox) logBox.value = _('No log entries.');
							});
						}
					}, _('Refresh')),
					' ',
					E('button', {
						'class': 'btn cbi-button-negative',
						'click': function() {
							if (confirm(_('Clear the upgrade log?'))) {
								fs.exec('/usr/bin/autoupgrade-clearlog').then(function() {
									var logBox = document.getElementById('autoupgrade-logbox');
									if (logBox) logBox.value = '';
								});
							}
						}
					}, _('Clear'))
				]),
				E('textarea', {
					'id': 'autoupgrade-logbox',
					'readonly': 'readonly',
					'style': 'width: 100%; height: 250px; font-family: monospace; font-size: 12px; resize: vertical;'
				}, logData || _('No log entries.'))
			])
		]);

		window.setTimeout(display, 0);

		return view;
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
