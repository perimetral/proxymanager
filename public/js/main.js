$(document).ready(() => {
	$('#loginForm_submit').click((ev) => {
		ev.preventDefault();
		$('#h_loginForm_username').val($('#loginForm_username').val());
		$('#h_loginForm_passhash').val(sha512($('#loginForm_password').val()));
		$('#h_loginForm').submit();
		return false;
	});
	$('#registerForm_submit').click((ev) => {
		ev.preventDefault();
		$('#h_registerForm_username').val($('#registerForm_username').val());
		$('#h_registerForm_passhash').val(sha512($('#registerForm_password').val()));
		$('#h_registerForm').submit();
		return false;
	});
});