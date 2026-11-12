export default function CartoonFriends({ variant = 'hero' }) {
  return <div className={`cartoon-friends cartoon-friends-${variant}`} aria-hidden="true">
    <div className="cartoon-friend cartoon-teddy"><img src={`${import.meta.env.BASE_URL}images/birthday-teddy.png`} alt="" width="1254" height="1254" decoding="async" draggable="false" /></div>
    <div className="cartoon-friend cartoon-bunny"><img src={`${import.meta.env.BASE_URL}images/birthday-bunny.png`} alt="" width="1254" height="1254" decoding="async" draggable="false" /></div>
  </div>;
}
