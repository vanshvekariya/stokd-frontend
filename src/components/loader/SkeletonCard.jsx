import { m } from 'framer-motion';
import PropTypes from 'prop-types';

const SkeletonCard = ({ index }) => {
  return (
    <m.div
      className="border border-gray-200 rounded-lg bg-white p-4 h-fit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="flex flex-col items-start gap-5">
        <div className="flex flex-col gap-3">
          {/* Logo/Icon skeleton */}
          <m.div
            className="w-10 h-10 rounded-full bg-gray-200"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          ></m.div>

          {/* Text Content skeleton */}
          <div className="flex flex-col gap-2">
            <m.div
              className="h-5 w-24 bg-gray-200 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            ></m.div>
            <m.div
              className="h-3 w-48 bg-gray-200 rounded"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            ></m.div>
          </div>
        </div>

        {/* Button skeleton */}
        <m.div
          className="h-10 w-24 bg-gray-200 rounded"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        ></m.div>
      </div>
    </m.div>
  );
};

SkeletonCard.propTypes = {
  index: PropTypes.number.isRequired,
};

export default SkeletonCard;
