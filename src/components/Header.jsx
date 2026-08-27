import Logo from "./Logo";

function Header(){
    return(
        <header className="w-full bg-gray-900 text-white flex justify-between items-center px-8 py-4 fixed top-0 left-0 z-50">
            <Logo />
        </header>
    );
}

export default Header;