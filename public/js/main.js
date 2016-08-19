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
});