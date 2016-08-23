$(document).ready(() => {
	$('#loginForm_submit').click((ev) => {
		ev.preventDefault();
		$('#h_loginForm_username').val($('#loginForm_username').val());
		$('#h_loginForm_passhash').val(sha512($('#loginForm_password').val()));
		$('#h_loginForm').submit();
		return false;
	});
	$('#changePasswordForm_submit').click((ev) => {
		ev.preventDefault();
		$('#h_changePasswordForm_passhash').val(sha512($('#changePasswordForm_password').val()));
		$('#h_changePasswordForm').submit();
		return false;
	});
	$('.removeLink').click((ev) => {
		ev.preventDefault();
		let proxyId = $(ev.target).attr('proxyId');
		$.ajax({
			type: 'POST',
			url: '/api/remove',
			data: { proxyId },
		}).then((data) => {
			if ('error' in data) alert(data.error);
			if (data.success) window.location = '/list';
		});
		return false;
	});
	$('.stopService').click((ev) => {
		ev.preventDefault();
		let proxyId = $(ev.target).attr('proxyId');
		$.ajax({
			type: 'POST',
			url: '/api/stop',
			data: { proxyId },
		}).then((data) => {
			if ('error' in data) alert(data.error);
			if (data.success) window.location = '/';
		});
		return false;
	});
});