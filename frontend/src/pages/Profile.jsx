import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCamera, FaTrashAlt, FaSignOutAlt, FaEdit } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import Swal from "sweetalert2";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice";

const Profile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    password: "",
  });
  const dispatch = useDispatch();

  const handleFileUpload = () => {
    fileRef.current.click();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement update logic
  };

  const handleDeleteAccount = async () => {
    // Show SweetAlert confirmation dialog
    Swal.fire({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover your account!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          dispatch(deleteUserStart());
          const res = await fetch(`/api/user/delete/${currentUser._id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await res.json();

          if (data.success === false) {
            dispatch(deleteUserFailure(data.message));

            // Show error SweetAlert
            Swal.fire({
              title: "Error!",
              text: data.message || "Failed to delete account",
              icon: "error",
              confirmButtonText: "Ok",
            });
            return;
          }

          dispatch(deleteUserSuccess());

          // Show success SweetAlert
          Swal.fire({
            title: "Deleted!",
            text: "Your account has been deleted.",
            icon: "success",
            confirmButtonText: "Ok",
          });
        } catch (error) {
          dispatch(deleteUserFailure(error.message));

          // Show error SweetAlert
          Swal.fire({
            title: "Error!",
            text: error.message || "Failed to delete account",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      }
    });
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-poppins">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-semibold text-onsurface">
          Profile
        </h1>

        <div className="relative mb-6 flex justify-center">
          <img
            src={encodeURI(currentUser.avatar)}
            alt="profile"
            className="h-9 w-9 rounded-full object-cover"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error("Image load error", e);
              e.target.src =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAA0lBMVEX///8tLS37+/vAGhn+/v78/Pz9/f28Gxm9AADkqagqKiomJia5AAAjIyMTExPAGRgfHx8YGBgWFhYNDQ0AAADR0dH09PTq6uq8vLzi4uKQkJBzc3NkZGTp6enV1dWurq5AQEAzMzO/ERCxsbFVVVU7OzuFhYV7e3tNTU2enp5ra2v34+PExMSkpKRFRUXc3NzFMjH77+9bW1vqwL/IQUHbi4vQYmHtx8f13d3fmJfw0dHUdnXmsbHSbm7gnZ3GSEfMWFjZg4LEODfEJyfIRkXMUlI5oAT+AAATTklEQVR4nN2deUPjLBPAaZrGmB5pUpseaq3x1qpbXY/12nXd/f5f6eUIDbmBQLvPO/9s7ULCjwEGhoGCFsDSMizywTBM/K9pGOQLy0gnaUVJeNJmkpg0ieK0JcWsAwiq0qoptFWnbsVzSr1FsVYE0pp1AEFV2hxAfm0r0qDB+RY1hd5AE8VJ/slBph5gKwW4tj64riaaTLu2Qq9vkEkV81/sg2aOBuWL+S/3wVpmImUQ/6U+mKfBGtZs7YWuN8hwvzpOywu4UTNRa0apEXDjZgLQutVU6HpzUQUzmVVaXYBU/guAIm/ByfZvZ4vx0cF4MbzdD+i3m2iipBOq7YPD67Pjk0a/1/M9z/N7fefkfPd6iDA3BQgUNtHJ9TkE67YdpxGL43T7/uBmOjS4ARWPbwJvKU27f30+6LNoCXH6g8YpgtRl6JUAFr8FgNlZ3yvEiyC7vZuLEX2l7qlanFbBW1pg/9LrluNRTbZPg/zHKZ6qMWnLc/L0QRCc7nDxRa31wliXmaBp62nQAouTPi8fFm8+LB7AlWuwNqBpTv2K/pfVY+86ryAqAHPT1mqiINjzBPmQ9KYKASuLWQtwNOfugQkZXK8PEBTl5HiLNCBEHJY0HsW+MfmcZnAuC9hwDq30fFxLHywG5NC91boTG0QT4l1wFLro1WLWTPot4FRmkFkp8cQgz9VoJkiSqpyFbwGLQQ3ARsNfSL9aNK1c1bSCE1E7mJTu2RpG0QJArpzgtEYnROIcBmAtgNmFKd9qYlITEBqMW0vzKBqllcy5K20oqHhHYC2AIPUXp+4nO3UBG+3LGoUW8Y3J5TyrrUKoxF3y3LUC8r4lqN0LMeKpZjOBk8jlPKpj7GPpjYF2QANI6X6vrYTQcQJTptCC0zqJqhk16ln7lfSn4oDC81YZ3S98NYCwnZo1ADm1LaP7UwUjKRF/LFVoAQ2C9C43V847Nd0QSvtOOyCgX/O/xQqUqRD258DU2kRlAA1rUm/dlBB/YeoFNJO4XLoHY2UDTTya6mqippGqGq6c10pmNETae5oBDSCh+wuFhM484Hy1fKyEeM6pQsKGPxIG5NYgSAPy5lRnDqH0hpqbKJDQvVJCuBDWpMHkLrdQNapYHK6kf6E6lCBdGcJVAxR4MBjpTlWGEuTUgUROxYRn/HUrA2jmf12ec1fZtLSxctdoMROAWnzRxn2pnlBXH6RxbYA3J0miaIUfEe4JF1pEg1KA6gl1AwrrXt3ykBDq64M4iUTjVkrY3QVqNZhJK1414FiRH4oQntUKJajUIJDICc6VEtIFop4myg/IVKNaQroEVm4maFrxqgGg5t5oivBCvNACGuSNa2MBJycqBxq4fDrTCmiJ5rQC6RiaQsSptj6I04o27gs1mzKs9CeWpj6YmNJwVk1L1ZYFS0iHU+VNlFh8sZwzhb5SKs6xVajB+oCgKmfqLYp2DpOE7aAIUHY1IQ+o1s9GZbDP82o9gBndK/XRUOnNdPVBUBTXVpxT6eqXir/QYiZI2tKc2WpUuzZkCHVGZAhVjSbCsdQ2Jo8GRQENba1UH2Dxgav84UnPSDOkZVDcB3Fawcatct9pJdha1Nl8KU8rVjU6LH6jm9hhU9pEhQHBsKce0DlvSWpQHrD4LYEGQuzY13btjWhO61j9YOod6GuiOInYHEjDxLQ/0QhoCs+BZsqbqXOuyUwUAVZUY0uppw1JvEeqcqoWpxWuGuUW0du3NDZRUHh7S2HOkeJZTfsSaAUEqb84ciqeuA2GqTKsC7DwLaaCOH1GUHQi76ulRlyJqql9XCYh/ky80AIaLNjlrsg5ctQNpzRQQVMTJWnFdX+tLDjR6e6LAoprW6ZqlE3dBgdyhZbRoNDwNKm6IoJTunf6ATO73Hy990iJ6xud0MsrvVJAWWt7pmAl7HhDQUApbctWzV59k9E7ki20yM1M0jmN47pTm8HFOgAtIPsWEMzrjTZkT031ij77OFlAmPOgXlfE7iddU7VEEjndwySjWuMpjtjT3kRrAda0+6xzRiugvO7h5K1GM3WckXYzkdzllrkZr84MnAlnqy708v4FyBdTPGccT1UjHLq3ANyAb3an875GwDiJOZRups6cPyjyym5uNe2PmoBSPd2SH2vgdIa7Dz6GW82mGy5l+mC08yR/O+VQ0mA48xZ33d53IGCzab8CqYZm1AKEs1O5nogPx/IBtn6HTSw2HW2Eiymle3oTwq2UB5x6n3jMxEeHADbDn+LFbBFAeQ0Cyfga75YbcNlxCeDWlv0mBSjVuOO7LFqGxPzbm/ICmuDVpoDN8GspVcxagDCJ+GDTnnMDmi+2SwFhT/whoUEqUoBmCyW5EOyKjjchb6p2BxnmrzAGbLr2VSZMUwdgnHNGbiMVXO33xmzmcnfQvc0ANpudR6APMHPtWDC+2yGnlMUupvNJXPeo550NzfJXt4xvIQvY3Oq88ALGPYkTMJ1kdnritxv4EksD7B/yT2184uM277qNbu/4enUnbe6rf9hJwK3wu6gGK+LaCjTYOjr2ungI7Q2Jm7/Ni+jje4VMMMUzWsfrXg7zX41WHks8zDCAcLDZFgWsaCcZ3cN/J1Pfp0COM8HzS94rIokGTXCwGp26g8PrAOTv077bacCm+7U0dQKi3rfnswNLe07a2eiOY5nhEO+ambz9BSryNHcLEVuKJCBU4kP1yeXU1VMigJPp3E+1x+4NciiZpnG2U2X6296YAA5TewJO1zs+yu4R/Q2zgHCwuRLTICiMa8vmHEL1ZSkQIk47bpe2VMc/3o80mPOUtteerkYd8uo3mwWMB5tfgoCAEzA4uBnkDyfd+YQs10dnveIBp++Qy4NNMM7f1XH6g90h82rDdXM0iAabp1LA7O1oXICT6WHxhcjtBu1Gi+OCWuh7p1RD173CB0HzcRTQVz/Y+YDN8LelUoPYTNzu9ovvk0fV71+Tt8CWfLeTTuq0/cHpJHqTcVa6udreOYocVFe2mw+ILYaABo0KDbaQYqovJO9dBtRm7l/cdP3o1wMcp933G3vj1R7JsOLub7hwjF792Mnpg+Rf5NCo0mByzCrRIDDG5wUNLyndxjhuFJPx6d7c8Xr9w/PLKfrlh+j9wXRQMd72ZpEH7slmNRjaHbZTdj75NYg+lGy+WEc3vPeRO729W7Yag9H+ZBQY7HPH8yqbGZ+Y/R7GgK799+HVZr5o2s/lGuQGPDoR2cxue5cTphotOrWPHrc4r36YN4oybXcY8+Ci6fbyV7wUboZ/BQCL49oW8+JRr0AFO3sL+qMryY4QXM+rGigCjG6jB0vqm0GAX8jEQ4pHZhpu3wNuwKK4ttEuR5Ey0u6d4I63eiySyXi3y9MYnBtaPZ8200SJ+YMW4iuexIXfgvT6ufiW0HzAcUPSYe/0/cO76Xg4CWCZgsni4OwcDq1cWamLETzbK+8TWfQaGOONsZCdD14N5gO2zmQUuIJs971YurxPord+mSByXSAz4aJBxYgwvrlx77SXnIBmHuDoWMeRgyoZkFmBad6zY8qfGBCOP8xw+s7XRHPj2maHOs7FVEn/lJSBui4i99rbCtBsXSUcby9cGjSMLOBQ+Cc5VIjjBFGVf7DeJ3tJMVDpfjFum/An93XgKcCFqI1QI/4RKYNJXBfRVC38Q0tvomL+YBf9xAVeoEFQokFFEWuC0j4mZWhFTu7Vit5cAVpo1c8sGd1vSy4NpqbpE+6hT634wwjwJeF96rwBBhAsm+yCw/7B0wdBcqMyUBgbKyLd3QgQuy7i1UTksjBpoX8z9gK5wHkAQeKvu02MolD8IAJ8Y3sanNEsE4DgMYwBsQuc477zxF/TTdjBBvnBEgzYYmZmaE7624ibKDKVn4ypRN30yawEtNi/1B/44RNnbkRl+GGzgM3wF6tBONB+JPcx4FBbCWiwfx1uphOiY8DEQYBMOruiD98TgHSnhlkLb6cBQRqwxfy1qTba3aMekHeb1SDsaK9ME0Wk90kveNNtLis0yALW/00OSelNotnJSwqwaX+CBCB4SvtQYYoqwJVi1d73KCBwQhqV4U+Y9qp9MubaTNZBk26aVh58o4A6DvjyCJyQRrvBbx22DxJCMwEICdMeODgYVe5jkK/1XJbAIf5B5Ioz7JQGYT/8BAlA8NRJAcLB5p4L0DJ13KzDI+1zWpCHThpwC440CUBw30kDbiEXOAegofamQAHx6I7AM7O8XZX+MQFoWW92GrBJYvoq4togoMqL5EUET0ixPHYygNhryADGa0e2MtzOsiquDf2l9HpnARnQDZunjpsBxAskBtAAr50MIInpK92oQdY20HCDF4/QX9Azzd9hFhDaglg9CDC18lgNSM+gCrBWxHYNcebEnFsgNeFcqefFYgGtb24O4FYU01ca16bhogQeiTykVou6LjIGcdtkAMFV6OYAbhGHRqGbH/0lF0NZW7p7dAT5TAfO0Pb3CRhAPKXJAWyG34xiQCxariirFv82AnzOBs5E7e87CwgXV7mAOKavPOxrM+MM8ZCiVTr2EuYAwvYXMICpJT7zAU5PzTLA240YQ6cbRCW6z0YG0Q9oX2YFuPxy8wFhc34vAsR5tdyMVCm9A1qir7zAmciz/REDms85kwL6gUSBF8S1gZrH7OSkfU4Dsn7YhYDYsx0BGuZ2vkkh058/+RrExmaykfmMt4hKhCxFESDsYEE8/XoPCwGxC7wA0ALjTZj77iWt8tecwBmmgz3RsrZA0YhL1sJfy1a2ieJdbj1XsFXJYD8CfMkJnGE+2A9RWVvYp19SGVHKrJPYMpVfqcMh/dXdwT/DMsAt3L/IDttHSX9txg7ybEzNaAOAzqERudfe7FLAphteEQ0iN04pYLSazAJuxEHTO4rca2bolgIye6TL8uaM9jGecvYxzI1Yw/YxHfYeMt6njL14jyrjvkLbMOl3y8po0NB0q2y5eMPI+3RVCYicvqTQ72FlWns795bQ9XtooKWICvKe45xJf4jsxfKrErDpustkE8WAxvp3K3ZoLOYTByCN0+NIC+dun2lA+CFY+7R7dUG5+T2sKjTam7Bx4tTGWi4gCb9JRZytf2ERXdkCZbuy0GRvAg2RwVeOpyoNiF3gaUAwVPhzjVzik2uFgBWEVYUmK3rkS7OeSmbdzL8uiulLufnXPSvFawrUV2i7qwKEoynyIxb4OZKAKAqcbsTEQaRrJozuDG6ZzwXepzQgjsjIOSCUCwgHpo8koAkO1mvwo/g8uBYiTm4OQDgfe/9W6OdIf+GSmL54N3jdhMRSQMCnimbHetXckFeD8AOO6WOO+Cn92dRqId4nZK++yrWSBAzDklVy6gvXfknu5w+V3oJYIU5jBMjs+KN8sddkm539++cfl57prgJEUeD0LG20fjkdrG9iivcpEOAyzDmXlt8H7YcrA5hXb98Kht6ced4bo0E0ag93M+dcNIlzYkTrm8+K1WwMiCP10fLCeMxVe05m98tgAPEueHB9460DEh1ybpEgw7J+lWiiV2C1hfg3Zwmc+xTs0EiGfQFzOL3p6YZ0zukKNa+suYMMOhW72kK86vAB4l259K+Swb+M2fRm4OlcSg2GEeB9qXstMYq22G3817RXv+gpnfd4H4NtsABMDvb6Pn94vZjAZWHkY3BL/RHMF4mwL8t8S03VC59CTmngTIm4NrIbOTvYnePTZ6oJ+7fRAZ0fpf4I9gt06jfeBIYTPT5AFNNHM7XydhaBgU6fHQ68vkpMdGwLA16F+buAWUBEyO5yvyTmQWXVxF6EkreziJ8ZTMbTvcYO5lQB2p9Eh71ey5wzyS/CR5Pd5U7F15YANl3XSMe1ZZ3++NHGDHLOG13P76Njk/KoyAeMH/vCD4i2LUAMiPcP+QBxTFwyrq3kGCZutrPxxdne8dzp9bx+vyuuVbJbiORn0TZnFhCuhR4YwGfGilYB4k3TZFQU1wmpYDQZHl1Mzy7PT9qDQa/nQ1zIy6Hc1cm7txKPUs7/4H1BAmj8DvkBUQtn+PjP11CBfxn7s8X46Brx3p3DduzvQBkg6SUEf7VzSHcBtwr3cfONd3gf9aTl93T4acUHum1V0UTz44rxB/b+F5oYHY69nWEZYpnNbm8n+/sjWj0Pxd6notb2+BQYxvODLaTBJo3pK7i9pdZvvoBVq6YfaEQ92qgu9D4VljXs2M3QFumD0QdyEUoVYGnAWIG208c74+eS60rEAPHQz67xeQHR9BRfhCLVROWuwDWLfYKchRYBxH5IZYB5d/Vk04L0rUh6AeFgg13gKpooJ+B2kfdJEyC5CEVxHyxJi46erRcQu8BBrUKLaNAkTu51AsJx+Gt9fdAs9D5pBMR3EyQKovV3l67yvU9aAUmcez1Dz5926eYFlugFdPFxjLU0UST3dscm0ll9yHxR8oE/bfzFa10NigCa4Opte83yUgCodKqWvzhJiln4P1KSfJz2qVp1fekzwSSuTR5QqIlmV19rGcBXovstijQoNdhLA0ppWxkgvx7qF7qeBmt2f45ibgawVh8UH9/+e31QsJh6p2qbHWSkATegwRp1+9/og3X08H9rJlbFlC/0f6KJrh1wbVO1+HHrecuGzASILL5UoTO30GtvorJ1+z/NvOXSwFJn6QAAAABJRU5ErkJggg==";
            }}
          />
          <button
            onClick={handleFileUpload}
            className="absolute bottom-0 right-1/2 translate-x-1/2 rounded-full bg-secondary p-2 text-onPrimary shadow-lg transition hover:bg-primaryVariant"
          >
            <FaCamera size={20} />
          </button>
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            className="hidden"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 transition focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
            <FaEdit
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <div className="relative">
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 transition focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
            <MdOutlineEmail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="New Password"
              className="w-full rounded-lg border border-gray-300 p-3 pl-10 transition focus:border-primary focus:ring-2 focus:ring-primary/50"
            />
            <RiLockPasswordLine
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary p-3 font-semibold uppercase text-onPrimary transition hover:bg-primaryVariant"
          >
            Update Profile
          </button>
        </form>

        <div className="mt-6 flex justify-between">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center text-red-600 transition hover:text-red-800"
          >
            <FaTrashAlt size={20} className="mr-2" />
            Delete Account
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center text-secondary transition hover:text-primaryVariant"
          >
            <FaSignOutAlt size={20} className="mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
