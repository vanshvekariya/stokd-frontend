import { Link } from 'react-router-dom';
import authBg from '../assets/authBg.png';
import PropTypes from 'prop-types';
import { LOGIN_TYPES, useLoginType } from '../utils/loginType';

const AuthLayout = ({ children, link, linkText, linkUrl, imageSrc }) => {
  const loginType = useLoginType();

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Login Link - Fixed */}
        <div className="px-6 pt-6 pb-4 flex justify-between bg-white">
          <div className="">
            <a
              href="https://www.stokd.com"
              target="_self"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <img src="/stokd-logo.svg" alt="Logo" className="h-10" />
            </a>
          </div>
          {loginType !== LOGIN_TYPES.ADMIN && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-icon-text">{linkText}</span>
              {link && (
                <span className="border border-border py-1 px-2 rounded-[8px]">
                  <Link to={linkUrl} className="text-text-info">
                    {link}
                  </Link>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col min-h-full">
            <div className="flex-1 flex items-center justify-center">
              {children}
            </div>
            <div className="px-8 py-4 m-auto">
              <p className="text-xs text-text-info">
                &copy; {new Date().getFullYear()} SToKD. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image (Fixed height) */}
      <div className="hidden lg:block flex-1">
        <img
          src={imageSrc ?? authBg}
          alt="Restaurant scene"
          className="h-screen w-full object-cover"
        />
      </div>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node,
  link: PropTypes.string,
  linkText: PropTypes.string,
  linkUrl: PropTypes.string,
  imageSrc: PropTypes.string,
};

export default AuthLayout;
